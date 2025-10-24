import { useState } from "react";
import { FileUpload } from "~/components/ui/FileUpload";
import { useDocumentStore } from "~/lib/stores";
import type { EmailSenderProps, CompressionInfo, FormData } from "~/lib/types";
import {
  HomeEmailTemplates,
  generateHomeDefaultMessage,
} from "../utils/email-utils";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";

export default function HomeEmailSender({
  formData,
  onEmailSent,
}: EmailSenderProps) {
  const [emailData, setEmailData] = useState({
    to: "henrique.danielb@gmail.com", // ✅ PRESET - email do destinatário
    subject: "Formulário Preenchido com Anexo", // ✅ PRESET
    message: "",
  });

  const [compressionInfo, setCompressionInfo] =
    useState<CompressionInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");

  const {
    uploadedFile,
    setUploadedFile,
    isSendingEmail,
    setIsSendingEmail,
    setPdfBytes,
    resetTemporaryState,
    setCurrentStep: setGlobalCurrentStep,
  } = useDocumentStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateDefaultMessage = () => {
    const message = generateHomeDefaultMessage(formData);
    setEmailData((prev) => ({
      ...prev,
      message,
    }));
  };

  const arrayBufferToBase64 = (buffer: Uint8Array): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const validateFormData = (): boolean => {
    const requiredFields = [
      "text_nome",
      "text_rg",
      "text_cpf",
      "text_universidade",
      "text_semestre",
      "text_curso",
      "text_mes",
      "text_dias",
      "text_cidade",
      "text_email", // ✅ Email do aluno (que vai no PDF)
      "signature",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof FormData]?.toString().trim()
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((field) => {
        const fieldConfig = homeFieldConfig.find((f) => f.key === field);
        return fieldConfig?.label || field;
      });
      throw new Error(
        `Campos obrigatórios não preenchidos: ${fieldNames.join(", ")}`
      );
    }

    // ✅ Validação apenas do email do ALUNO (que vai no PDF)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.text_email)) {
      throw new Error("Email do aluno inválido");
    }

    return true;
  };

  const handleFileSelect = (file: File | null) => {
    setUploadedFile(file);
  };

  // ✅ FUNÇÃO PARA LIMPAR TUDO APÓS ENVIO BEM-SUCEDIDO
  const resetAfterSuccessfulSend = () => {
    // Reset apenas campos do email (mantém o preset)
    setEmailData({
      to: "henrique.danielb@gmail.com", // Mantém o preset
      subject: "Formulário Preenchido com Anexo", // Mantém o preset
      message: "",
    });

    // ❌ NÃO limpa o uploadedFile aqui - será limpo pelo resetTemporaryState do store
    setCompressionInfo(null);
    setPdfBytes(null);

    // Reset estado temporário (isso limpa o uploadedFile apenas após envio bem-sucedido)
    resetTemporaryState();

    // Volta para tela de formulário
    setGlobalCurrentStep("form");
  };

  // ✅ FUNÇÃO PARA VOLTAR SEM LIMPAR (quando o usuário clica em "Voltar")
  const handleBackToForm = () => {
    // Apenas volta para o formulário sem limpar nada
    setGlobalCurrentStep("form");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSendingEmail(true);
    setCompressionInfo(null);
    setCurrentStep("");

    try {
      // ETAPA 1: Validação
      setCurrentStep("Validando formulário...");

      // Valida campos obrigatórios do email
      if (!emailData.to || !emailData.subject || !emailData.message) {
        throw new Error("Preencha todos os campos obrigatórios do email");
      }

      // ✅ Valida apenas o formulário (email do aluno)
      validateFormData();

      // ETAPA 2: Geração do PDF
      setCurrentStep("Gerando PDF do formulário...");
      let formPdfBytes: Uint8Array;
      try {
        const { generateHomeFormPdf } = await import("../utils/pdf-utils");
        formPdfBytes = await generateHomeFormPdf(formData);
        setPdfBytes(formPdfBytes);
      } catch (error) {
        throw new Error(
          `Erro na geração do PDF: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }

      // ETAPA 3: Merge de PDFs
      let finalPdfBytes = formPdfBytes;
      let isMerged = false;

      if (uploadedFile) {
        setCurrentStep("Mesclando PDFs...");
        try {
          const { PdfMergeUtils } = await import("~/lib/utils/pdf-merge");
          const uploadedPdfBytes = await uploadedFile.arrayBuffer();
          const mergeResult = await PdfMergeUtils.mergePdfs(
            formPdfBytes,
            new Uint8Array(uploadedPdfBytes)
          );
          finalPdfBytes = mergeResult.mergedBytes;
          isMerged = true;
        } catch (error) {
          throw new Error(
            `Erro no merge de PDFs: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          );
        }
      }

      // ETAPA 4: Compressão
      setCurrentStep("Verificando compressão...");
      let pdfToSend = finalPdfBytes;

      const emailHtml = HomeEmailTemplates.formEmail(
        emailData.subject,
        formData,
        emailData.message
      );

      const { PdfCompressUtils } = await import("~/lib/utils/pdf-compress");
      const needsCompression = PdfCompressUtils.needsCompression(
        finalPdfBytes,
        emailHtml
      );

      if (needsCompression) {
        setCurrentStep("Comprimindo PDF...");
        try {
          const compressResult = await PdfCompressUtils.compressPdf(
            finalPdfBytes,
            (info) => {
              setCompressionInfo(info);
            }
          );
          pdfToSend = compressResult.compressedBytes;

          if (compressResult.info && !compressResult.info.success) {
            throw new Error(
              `O PDF é muito grande (${(
                compressResult.info.compressedSize /
                1024 /
                1024
              ).toFixed(2)} MB) mesmo após compressão. ` +
                `O limite total do Resend é 15MB. Por favor, reduza o tamanho do PDF anexado.`
            );
          }
        } catch (error) {
          throw new Error(
            `Erro na compressão: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          );
        }
      }

      // ETAPA 5: Envio do Email
      setCurrentStep("Enviando email...");
      const pdfBase64 = arrayBufferToBase64(pdfToSend);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to, // ✅ Email do destinatário (pode ser qualquer um válido)
          subject: emailData.subject,
          html: emailHtml,
          attachments: [
            {
              filename: isMerged
                ? "formulario-com-anexo.pdf"
                : "formulario-preenchido.pdf",
              content: pdfBase64,
              contentType: "application/pdf",
              encoding: "base64",
            },
          ],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar email");
      }

      // ✅ SUCESSO: Limpa TUDO e volta para formulário
      alert("Email enviado com sucesso!");

      // Limpa todos os campos (formulário + email) APÓS ENVIO BEM-SUCEDIDO
      resetAfterSuccessfulSend();

      // Notifica o componente pai
      onEmailSent?.();
    } catch (error) {
      // ❌ ERRO: Mantém TUDO como estava (incluindo PDF anexado)
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsSendingEmail(false);
      setCurrentStep("");
    }
  };

  const hasFormData =
    formData.text_nome &&
    formData.text_rg &&
    formData.text_cpf &&
    formData.signature;

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Enviar Documento por Email
      </h2>

      <form onSubmit={handleSendEmail} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Para * (Destinatário)
          </label>
          <input
            type="email"
            name="to"
            value={emailData.to}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite o email do destinatário"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Email para onde será enviado o formulário
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assunto *
          </label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Assunto do email"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mensagem *
            </label>
            <button
              type="button"
              onClick={generateDefaultMessage}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Gerar Mensagem Padrão
            </button>
          </div>
          <textarea
            name="message"
            value={emailData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite sua mensagem..."
            required
          />
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf"
          label="Selecionar PDF para Anexar"
          required={false}
        />

        {uploadedFile && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-green-700 dark:text-green-300">
                  📄 {uploadedFile.name}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                Pronto para enviar
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSendingEmail || !hasFormData}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSendingEmail
            ? `📧 ${currentStep || "Enviando..."}`
            : "📧 Enviar Documento por Email"}
        </button>
      </form>

      {/* Botão para voltar sem limpar nada */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={handleBackToForm}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          ← Voltar ao Formulário (Manter Anexo)
        </button>
      </div>
    </div>
  );
}

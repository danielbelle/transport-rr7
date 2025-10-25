import { useState, useEffect } from "react";
import { FileUpload } from "~/components/ui/FileUpload";
import { FormSignature } from "~/components/ui/FormSignature";
import { useDocumentStore } from "~/lib/stores";
import type { EmailSenderProps, CompressionInfo, FormData } from "~/lib/types";
import {
  HomeEmailTemplates,
  generateHomeDefaultMessage,
} from "../utils/email-utils";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";

interface HomeEmailSenderProps extends EmailSenderProps {
  onSignatureUpdate?: (signatureData: string | null) => void;
}

export default function HomeEmailSender({
  formData,
  onEmailSent,
  onSignatureUpdate,
}: HomeEmailSenderProps) {
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

  // ✅ CORREÇÃO: Recuperar assinatura do sessionStorage ao montar
  useEffect(() => {
    const tempSignature = sessionStorage.getItem("temp_signature");
    if (tempSignature && !formData.signature) {
      console.log("🔄 Recuperando assinatura do sessionStorage");
      onSignatureUpdate?.(tempSignature);
    }
  }, [formData.signature, onSignatureUpdate]);

  const generateDefaultMessage = () => {
    return generateHomeDefaultMessage(formData);
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
      "text_email",
      "signature", // ✅ Agora a assinatura é obrigatória aqui
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

    // ✅ CORREÇÃO: Validação mais flexível do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const studentEmail = formData.text_email;

    if (!studentEmail || !emailRegex.test(studentEmail)) {
      throw new Error(
        "Email do aluno inválido. Formato correto: exemplo@dominio.com"
      );
    }

    return true;
  };

  const handleFileSelect = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleSignatureChange = (
    fieldKey: string,
    signatureData: string | null
  ) => {
    // ✅ CORREÇÃO: Notificar o componente pai sobre a atualização da assinatura
    onSignatureUpdate?.(signatureData);
    console.log(
      "✅ Assinatura atualizada e propagada para o pai:",
      signatureData ? "PRESENTE" : "REMOVIDA"
    );
  };

  // ✅ FUNÇÃO PARA LIMPAR TUDO APÓS ENVIO BEM-SUCEDIDO
  const resetAfterSuccessfulSend = () => {
    // Reset arquivo anexado
    setUploadedFile(null);
    setCompressionInfo(null);
    setPdfBytes(null);

    // Reset estado temporário
    resetTemporaryState();

    // Volta para tela de formulário
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

      // ✅ Valida apenas o formulário (incluindo assinatura)
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

      // ✅ Gerar mensagem padrão automaticamente
      const message = generateDefaultMessage();
      const emailHtml = HomeEmailTemplates.formEmail(
        "Formulário Preenchido com Anexo", // ✅ Assunto fixo
        formData,
        message // ✅ Mensagem padrão
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
          to: "henrique.danielb@gmail.com", // ✅ Email fixo do destinatário
          subject: "Formulário Preenchido com Anexo", // ✅ Assunto fixo
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

      // Limpa todos os campos APÓS ENVIO BEM-SUCEDIDO
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
    formData.text_nome && formData.text_rg && formData.text_cpf;

  // ✅ Encontrar campo de assinatura
  const signatureField = homeFieldConfig.find(
    (field) => field.type === "signature"
  );

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Enviar Documento por Email
      </h2>

      <form onSubmit={handleSendEmail} className="space-y-6">
        {/* ✅ Seção: Assinatura */}
        {signatureField && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
              ✍️ Assinatura {formData.signature ? "✅" : "❌"}
            </h3>
            <FormSignature
              key={signatureField.key}
              field={signatureField}
              onSignatureChange={handleSignatureChange}
              initialSignature={formData.signature}
            />
            {/* ✅ DEBUG */}
            {formData.signature && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Assinatura carregada: {formData.signature.substring(0, 50)}
                  ...
                </p>
              </div>
            )}
          </div>
        )}

        {/* ✅ Seção: Anexar PDF */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            📎 Anexar PDF
          </h3>
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
        </div>

        {/* ✅ Informações do envio */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            ℹ️ Informações do Envio
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <p>
              <strong>Destinatário:</strong> henrique.danielb@gmail.com
            </p>
            <p>
              <strong>Assunto:</strong> Formulário Preenchido com Anexo
            </p>
            <p>
              <strong>Mensagem:</strong> Será gerada automaticamente com os
              dados do formulário
            </p>
            <p>
              <strong>Email do aluno no PDF:</strong>{" "}
              {formData.text_email || "Não preenchido"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSendingEmail || !hasFormData || !formData.signature}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSendingEmail
            ? `📧 ${currentStep || "Enviando..."}`
            : "📧 Enviar Documento por Email"}
        </button>
      </form>

      {/* ✅ Botão para voltar sem limpar nada - APENAS AQUI */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setGlobalCurrentStep("form")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          ← Voltar ao Formulário (Manter Anexo)
        </button>
      </div>
    </div>
  );
}

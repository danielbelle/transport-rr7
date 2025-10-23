import { useEffect, useState } from "react";
import { devLog } from "~/utils/dev-log";
import { EmailTemplates } from "~/utils/email-templates";
import { generateFormPdf } from "~/utils/pdf-form-edit";
import { PdfCompressUtils } from "~/utils/pdf-compress";
import { PdfMergeUtils } from "~/utils/pdf-merge";
import type { EmailSenderProps, CompressionInfo } from "~/utils/types";
import { FileUpload } from "~/components/ui/FileUpload";

export default function EmailSender({
  formData,
  onEmailSent,
}: EmailSenderProps) {
  const [emailData, setEmailData] = useState({
    to: "henrique.danielb@gmail.com",
    subject: "Formulário Preenchido com Anexo",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] =
    useState<CompressionInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");

  // Helpers de debug
  const formatBytes = (bytes?: number) =>
    typeof bytes === "number"
      ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
      : "n/a";

  useEffect(() => {
    devLog.info("📨 [EmailSender] Montado", {
      formDataKeys: Object.keys(formData || {}),
    });
    return () => devLog.info("📨 [EmailSender] Desmontado");
  }, []);

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
    const message = `Prezados,

Segue em anexo o formulário preenchido com os seguintes dados:

• Nome: ${formData.text_nome || "Não informado"}
• RG: ${formData.text_rg || "Não informado"} 
• CPF: ${formData.text_cpf || "Não informado"}

Atenciosamente,
Sistema T-App`;

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
    if (!formData.text_nome?.trim()) {
      throw new Error("Campo 'Nome' não preenchido");
    }
    if (!formData.text_rg?.trim()) {
      throw new Error("Campo 'RG' não preenchido");
    }
    if (!formData.text_cpf?.trim()) {
      throw new Error("Campo 'CPF' não preenchido");
    }
    if (!formData.signature) {
      throw new Error("Assinatura não realizada");
    }
    return true;
  };

  const handleFileSelect = (file: File | null) => {
    setUploadedFile(file);
    devLog.log("📨 [EmailSender] Arquivo selecionado:", {
      hasFile: !!file,
      name: file?.name,
      size: file ? formatBytes(file.size) : "n/a",
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    devLog.info("📨 [EmailSender] handleSendEmail iniciado", {
      emailData,
      hasUploadedFile: !!uploadedFile,
    });

    setIsSending(true);
    setCompressionInfo(null);
    setCurrentStep("");

    try {
      // ETAPA 1: Validação
      setCurrentStep("Validando formulário...");
      devLog.log("📨 [EmailSender] Etapa 1: Validando dados do email");

      if (!emailData.to || !emailData.subject || !emailData.message) {
        throw new Error("Preencha todos os campos obrigatórios do email");
      }

      validateFormData();
      devLog.log("📨 [EmailSender] Validação do formulário OK");

      // ETAPA 2: Geração do PDF
      setCurrentStep("Gerando PDF do formulário...");
      devLog.log("📨 [EmailSender] Etapa 2: Gerando PDF do formulário");

      let formPdfBytes: Uint8Array;
      try {
        formPdfBytes = await generateFormPdf(formData);
        devLog.log("✅ [EmailSender] PDF do formulário gerado", {
          bytes: formPdfBytes.length,
          size: formatBytes(formPdfBytes.length),
        });
      } catch (error) {
        devLog.error("❌ [EmailSender] Erro na geração do PDF:", error);
        throw new Error(
          `Erro na geração do PDF: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }

      // ETAPA 3: Merge de PDFs (se aplicável)
      let finalPdfBytes = formPdfBytes;
      let isMerged = false;

      if (uploadedFile) {
        setCurrentStep("Mesclando PDFs...");
        devLog.log("📨 [EmailSender] Etapa 3: Merge com PDF anexado", {
          fileName: uploadedFile.name,
          fileSize: formatBytes(uploadedFile.size),
        });

        try {
          const uploadedPdfBytes = await uploadedFile.arrayBuffer();
          const mergeResult = await PdfMergeUtils.mergePdfs(
            formPdfBytes,
            new Uint8Array(uploadedPdfBytes)
          );

          finalPdfBytes = mergeResult.mergedBytes;
          isMerged = true;

          devLog.log("✅ [EmailSender] Merge realizado com sucesso", {
            mergedSize: formatBytes(finalPdfBytes.length),
            totalPages: mergeResult.pageCount,
          });
        } catch (error) {
          devLog.error("❌ [EmailSender] Erro no merge de PDFs:", error);
          throw new Error(
            `Erro no merge de PDFs: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          );
        }
      } else {
        devLog.log(
          "📨 [EmailSender] Nenhum PDF anexado - usando apenas formulário"
        );
      }

      // ETAPA 4: Compressão
      setCurrentStep("Verificando compressão...");
      devLog.log("📨 [EmailSender] Etapa 4: Compressão/verificação", {
        finalSize: formatBytes(finalPdfBytes.length),
        isMerged,
      });

      let pdfToSend = finalPdfBytes;
      const emailHtml = EmailTemplates.formEmail(
        emailData.subject,
        formData,
        emailData.message
      );

      const needsCompression = PdfCompressUtils.needsCompression(
        finalPdfBytes,
        emailHtml
      );
      devLog.log("📨 [EmailSender] needsCompression:", needsCompression);

      if (needsCompression) {
        setCurrentStep("Comprimindo PDF...");
        devLog.log("📨 [EmailSender] Iniciando compressão");
        try {
          const compressResult = await PdfCompressUtils.compressPdf(
            finalPdfBytes,
            (info) => {
              devLog.log(
                "📨 [EmailSender] Progresso/resultado compressão:",
                info
              );
              setCompressionInfo(info);
            }
          );

          pdfToSend = compressResult.compressedBytes;

          devLog.log("✅ [EmailSender] Compressão concluída", {
            original: formatBytes(finalPdfBytes.length),
            compressed: formatBytes(pdfToSend.length),
            info: compressResult.info,
          });

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
          devLog.error("❌ [EmailSender] Erro na compressão:", error);
          throw new Error(
            `Erro na compressão: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          );
        }
      }

      // ETAPA 5: Envio do Email
      setCurrentStep("Enviando email...");
      devLog.log("📨 [EmailSender] Etapa 5: Envio de email", {
        attachmentName: isMerged
          ? "formulario-com-anexo.pdf"
          : "formulario-preenchido.pdf",
        size: formatBytes(pdfToSend.length),
      });

      const pdfBase64 = arrayBufferToBase64(pdfToSend);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to,
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
      devLog.log("📨 [EmailSender] Resposta envio", {
        ok: response.ok,
        status: response.status,
        result,
      });

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar email");
      }

      alert("Email enviado com sucesso!");
      onEmailSent?.(pdfToSend);

      setEmailData((prev) => ({
        ...prev,
        subject: "Formulário Preenchido com Anexo",
        message: "",
      }));

      // Limpar arquivo após envio bem-sucedido
      setUploadedFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      devLog.error(
        `❌ [EmailSender] Erro no envio (etapa: ${currentStep}):`,
        error
      );

      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsSending(false);
      setCurrentStep("");
      devLog.info("📨 [EmailSender] handleSendEmail finalizado");
    }
  };

  // Status do anexo para display
  const hasAttachment = !!uploadedFile;
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
        {/* Campos do email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Para *
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

        {/* Componente de Upload integrado */}
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf"
          label="Selecionar PDF para Anexar"
          required={false}
        />

        <button
          type="submit"
          disabled={isSending || !hasFormData}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSending
            ? `📧 ${currentStep || "Enviando..."}`
            : "📧 Enviar Documento por Email"}
        </button>

        {!hasFormData && (
          <div className="text-center text-red-600 dark:text-red-400 text-sm">
            ⚠️ Preencha todos os campos do formulário para enviar o email
          </div>
        )}
      </form>

      {/* Informações do Anexo */}
      <div
        className={`p-4 rounded-md border mt-4 ${
          hasAttachment
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
        }`}
      >
        <h4
          className={`font-medium mb-2 ${
            hasAttachment
              ? "text-green-800 dark:text-green-300"
              : "text-yellow-800 dark:text-yellow-300"
          }`}
        >
          {hasAttachment ? "✅ Anexo Pronto para Envio" : "📎 Anexo Opcional"}
        </h4>
        <div
          className={`text-sm space-y-1 ${
            hasAttachment
              ? "text-green-700 dark:text-green-400"
              : "text-yellow-700 dark:text-yellow-400"
          }`}
        >
          <div>
            <strong>Formulário:</strong>{" "}
            {hasFormData ? "✓ Pronto" : "⏳ Pendente"}
          </div>
          <div>
            <strong>PDF Anexado:</strong>{" "}
            {hasAttachment
              ? `✓ ${uploadedFile?.name}`
              : "⏳ Nenhum selecionado"}
          </div>
          <div>
            <strong>Merge:</strong>{" "}
            {hasAttachment ? "✓ Será realizado" : "⏳ Não necessário"}
          </div>
          {currentStep && (
            <div className="text-blue-600 dark:text-blue-400 mt-2">
              🔄 {currentStep}
            </div>
          )}
        </div>
      </div>

      {/* Dados do Formulário para Referência */}
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Dados do Formulário:
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <div>
            <strong>Nome:</strong> {formData.text_nome || "Não preenchido"}
          </div>
          <div>
            <strong>RG:</strong> {formData.text_rg || "Não preenchido"}
          </div>
          <div>
            <strong>CPF:</strong> {formData.text_cpf || "Não preenchido"}
          </div>
          <div>
            <strong>Assinatura:</strong>{" "}
            {formData.signature ? "✓ Pronta" : "⏳ Pendente"}
          </div>
        </div>
      </div>

      {/* Informações de Compressão */}
      {compressionInfo && (
        <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
            Informações de Compressão:
          </h4>
          <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
            <div>
              <strong>Original:</strong>{" "}
              {formatBytes(compressionInfo.originalSize)}
            </div>
            <div>
              <strong>Comprimido:</strong>{" "}
              {formatBytes(compressionInfo.compressedSize)}
            </div>
            <div>
              <strong>Redução:</strong>{" "}
              {compressionInfo.compressionRatio.toFixed(1)}%
            </div>
            <div>
              <strong>Status:</strong>{" "}
              {compressionInfo.success ? "✅ Sucesso" : "⚠️ Atenção"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

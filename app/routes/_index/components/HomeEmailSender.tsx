import { useState, useEffect } from "react";
import { FileUpload } from "~/components/ui/FileUpload";
import { FormSignature } from "~/components/ui/FormSignature";
import { useDocumentStore } from "~/lib/stores";
import type { EmailSenderProps, CompressionInfo } from "~/lib/types";
import {
  HomeEmailTemplates,
  generateHomeDefaultMessage,
} from "~/routes/_index/utils/email-utils";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";
import { validateFormData, validatePdfFile } from "~/lib/utils";

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

  useEffect(() => {
    const tempSignature = sessionStorage.getItem("temp_signature");
    if (tempSignature && !formData.signature) {
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

  const validateFormDataForEmail = (): boolean => {
    const result = validateFormData(formData);

    if (!result.success) {
      throw new Error(result.errors.join(", "));
    }

    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const result = validatePdfFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!result.success) {
        alert(result.errors.join(", "));
        return;
      }
    }

    setUploadedFile(file);
  };

  const handleSignatureChange = (
    fieldKey: string,
    signatureData: string | null
  ) => {
    onSignatureUpdate?.(signatureData);
  };

  const resetAfterSuccessfulSend = () => {
    setUploadedFile(null);
    setCompressionInfo(null);
    setPdfBytes(null);
    resetTemporaryState();
    setGlobalCurrentStep("form");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSendingEmail(true);
    setCompressionInfo(null);
    setCurrentStep("");

    try {
      setCurrentStep("Validando formulário...");
      validateFormDataForEmail();

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

      let finalPdfBytes = formPdfBytes;
      let isMerged = false;

      //  garantir que uploadedFile existe e é válido
      if (
        uploadedFile &&
        uploadedFile instanceof File &&
        typeof uploadedFile.arrayBuffer === "function"
      ) {
        setCurrentStep("Mesclando PDFs...");
        try {
          const { PdfMergeUtils } = await import("~/lib/utils/pdf-merge");
          const uploadedPdfBytes = await uploadedFile.arrayBuffer();

          //  garantir que o arrayBuffer não está vazio
          if (!uploadedPdfBytes || uploadedPdfBytes.byteLength === 0) {
            throw new Error("O arquivo anexado está vazio ou corrompido");
          }

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
      } else if (uploadedFile) {
        // Caso uploadedFile existe mas não é um File válido
        console.warn("UploadedFile inválido:", uploadedFile);
        throw new Error(
          "O arquivo anexado é inválido. Por favor, selecione novamente."
        );
      }

      setCurrentStep("Verificando compressão...");
      let pdfToSend = finalPdfBytes;

      const message = generateDefaultMessage();
      const emailHtml = HomeEmailTemplates.formEmail(
        "Formulário Preenchido com Anexo",
        formData,
        message
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
              ).toFixed(
                2
              )} MB) mesmo após compressão. O limite total do Resend é 15MB. Por favor, reduza o tamanho do PDF anexado.`
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

      setCurrentStep("Enviando email...");
      const pdfBase64 = arrayBufferToBase64(pdfToSend);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "henrique.danielb@gmail.com",
          subject: "Formulário Preenchido com Anexo",
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

      alert("Email enviado com sucesso!");
      resetAfterSuccessfulSend();
      onEmailSent?.();
    } catch (error) {
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

  const signatureField = homeFieldConfig.find(
    (field) => field.type === "signature"
  );

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Enviar Documento por Email
      </h2>

      <form onSubmit={handleSendEmail} className="space-y-6">
        {signatureField && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
              Assinatura {formData.signature ? "✅" : "❌"}
            </h3>
            <FormSignature
              key={signatureField.key}
              field={signatureField}
              onSignatureChange={handleSignatureChange}
              initialSignature={formData.signature}
            />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            Anexar PDF {uploadedFile && "✅"}
          </h3>
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".pdf"
            label="Selecionar PDF para Anexar"
            required={true}
          />
        </div>

        <button
          type="submit"
          disabled={
            isSendingEmail ||
            !hasFormData ||
            !formData.signature ||
            !uploadedFile
          }
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSendingEmail
            ? `${currentStep || "Enviando..."}`
            : "Enviar Documento por Email"}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setGlobalCurrentStep("form")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          Voltar ao Formulário (Manter Anexo)
        </button>
      </div>
    </div>
  );
}

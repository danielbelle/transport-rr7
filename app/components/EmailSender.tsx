import { useState, useRef, useEffect, useCallback } from "react";
import { devLog } from "~/utils/dev-log";
import { emailTemplates } from "~/utils/email-templates";
import type { EmailSenderProps } from "~/components/types";

export default function EmailSender({
  pdfBytes,
  formData,
  onEmailSent,
  pdfMergeRef,
}: EmailSenderProps) {
  const [emailData, setEmailData] = useState({
    to: "henrique.danielb@gmail.com",
    subject: "Formulário Preenchido com Anexo",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(null);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  // CORREÇÃO: Função para verificar o estado do anexo
  const checkAttachmentStatus = useCallback(() => {
    const formPdfReady = !!pdfBytes;
    let uploadedFileReady = false;

    if (pdfMergeRef?.current) {
      uploadedFileReady = pdfMergeRef.current.hasUploadedFile();
    }

    const canSend = pdfMergeRef?.current
      ? uploadedFileReady && formPdfReady
      : formPdfReady;

    setHasUploadedFile(uploadedFileReady);
    setHasAttachment(canSend);

    devLog.log("📎 Status do Anexo:", {
      formPdfReady,
      uploadedFileReady,
      canSend,
      hasPdfMergeRef: !!pdfMergeRef?.current,
    });
  }, [pdfBytes, pdfMergeRef]);

  // CORREÇÃO: Registrar callback no PdfMergeWithForm
  useEffect(() => {
    if (pdfMergeRef?.current && (pdfMergeRef.current as any).setOnFileChange) {
      (pdfMergeRef.current as any).setOnFileChange((hasFile: boolean) => {
        devLog.log("📁 Callback recebido do PdfMergeWithForm:", hasFile);
        setHasUploadedFile(hasFile);
        checkAttachmentStatus(); // Recalcular status completo
      });
    }
  }, [pdfMergeRef, checkAttachmentStatus]);

  // CORREÇÃO: Verificar status quando pdfBytes mudar
  useEffect(() => {
    checkAttachmentStatus();
  }, [pdfBytes, checkAttachmentStatus]);

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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert("Preencha todos os campos obrigatórios do email");
      return;
    }

    // CORREÇÃO: Verificação final antes do envio
    checkAttachmentStatus();

    if (!hasAttachment) {
      let errorMessage = "Nenhum anexo disponível para enviar.";

      if (!pdfBytes) {
        errorMessage += " Preencha o formulário para gerar o PDF.";
      } else if (pdfMergeRef?.current && !hasUploadedFile) {
        errorMessage +=
          " Selecione um PDF para anexar no componente 'Mesclar PDFs'.";
      }

      alert(errorMessage);
      return;
    }

    setIsSending(true);

    try {
      let finalPdfBytes = pdfBytes;

      // Se houver referência para o merge e arquivo selecionado, realizar merge
      if (pdfMergeRef?.current && hasUploadedFile) {
        devLog.log("Realizando merge antes do envio...");
        const mergedBytes = await pdfMergeRef.current.performMerge();
        if (mergedBytes) {
          finalPdfBytes = mergedBytes;
          setMergedPdfBytes(mergedBytes);
          devLog.log("Merge realizado com sucesso!");
        } else {
          devLog.log("Merge não realizado, usando PDF original");
        }
      }

      if (!finalPdfBytes) {
        alert("Nenhum PDF disponível para enviar");
        return;
      }

      const pdfBase64 = btoa(
        String.fromCharCode(...new Uint8Array(finalPdfBytes))
      );

      // USANDO O TEMPLATE SEPARADO
      const emailHtml = emailTemplates.formEmail(
        emailData.subject,
        formData,
        emailData.message
      );

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
              filename: mergedPdfBytes
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
      onEmailSent?.(finalPdfBytes);

      // Limpar formulário
      setEmailData((prev) => ({
        ...prev,
        subject: "Formulário Preenchido com Anexo",
        message: "",
      }));
    } catch (error) {
      devLog.error("Erro no envio de email:", error);
      alert("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Enviar PDF por Email
      </h2>

      <form onSubmit={handleSendEmail} className="space-y-4">
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

        {/* Informações do Anexo */}
        <div
          className={`p-4 rounded-md border ${
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
            {hasAttachment
              ? "✅ Anexo Pronto para Envio"
              : "⚠️ Aguardando Anexo"}
          </h4>
          <div
            className={`text-sm space-y-1 ${
              hasAttachment
                ? "text-green-700 dark:text-green-400"
                : "text-yellow-700 dark:text-yellow-400"
            }`}
          >
            <div>
              <strong>Arquivo:</strong>{" "}
              {mergedPdfBytes
                ? "formulario-com-anexo.pdf"
                : "formulario-preenchido.pdf"}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              {hasAttachment ? "Pronto para envio" : "Nenhum anexo disponível"}
            </div>
            {pdfBytes && (
              <div>
                <strong>Formulário:</strong> ✓ Pronto (
                {(pdfBytes.length / 1024).toFixed(2)} KB)
              </div>
            )}
            {pdfMergeRef && (
              <div>
                <strong>PDF Anexado:</strong>{" "}
                {hasUploadedFile ? "✓ Selecionado" : "⏳ Aguardando seleção"}
              </div>
            )}
            {pdfMergeRef && (
              <div>
                <strong>Merge:</strong>{" "}
                {mergedPdfBytes ? "✓ Realizado" : "⏳ Será realizado no envio"}
              </div>
            )}
            {pdfMergeRef && !hasUploadedFile && (
              <div className="text-red-600 dark:text-red-400 mt-2">
                ⚠️ Selecione um PDF para anexar no componente "Mesclar PDFs"
              </div>
            )}
            {!pdfBytes && (
              <div className="text-red-600 dark:text-red-400 mt-2">
                ⚠️ Preencha o formulário para gerar o PDF
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSending || !hasAttachment}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSending ? "📧 Enviando Email..." : "📧 Enviar PDF por Email"}
        </button>

        {!hasAttachment && (
          <div className="text-center text-red-600 dark:text-red-400 text-sm">
            ⚠️ É necessário ter um anexo para enviar o email
          </div>
        )}
      </form>

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
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { devLog } from "~/utils/dev-log";
import type { EmailWithPdfProps } from "~/utils/types";

export default function EmailWithPdf({
  formPdfBytes,
  formData,
}: EmailWithPdfProps) {
  const [emailData, setEmailData] = useState({
    to: "henrique.danielb@gmail.com",
    subject: "Formulário Preenchido com Anexo",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

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

    if (!formPdfBytes) {
      alert(
        "Nenhum PDF mesclado disponível para enviar. Realize o merge primeiro."
      );
      return;
    }

    setIsSending(true);

    try {
      const pdfBase64 = btoa(
        String.fromCharCode(...new Uint8Array(formPdfBytes))
      );

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">${emailData.subject}</h2>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Dados do Formulário:</h3>
                <p style="margin: 5px 0;"><strong>Nome:</strong> ${
                  formData.text_nome || "Não informado"
                }</p>
                <p style="margin: 5px 0;"><strong>RG:</strong> ${
                  formData.text_rg || "Não informado"
                }</p>
                <p style="margin: 5px 0;"><strong>CPF:</strong> ${
                  formData.text_cpf || "Não informado"
                }</p>
              </div>
              <div style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 5px;">
                ${emailData.message}
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 5px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Email enviado via T-App | Formulário em anexo
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "formulario-com-anexo.pdf",
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
        Enviar PDF Mesclado por Email
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
            formPdfBytes
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          }`}
        >
          <h4
            className={`font-medium mb-2 ${
              formPdfBytes
                ? "text-green-800 dark:text-green-300"
                : "text-yellow-800 dark:text-yellow-300"
            }`}
          >
            {formPdfBytes ? "✅ PDF Mesclado Pronto" : "⚠️ Aguardando Merge"}
          </h4>
          <div
            className={`text-sm space-y-1 ${
              formPdfBytes
                ? "text-green-700 dark:text-green-400"
                : "text-yellow-700 dark:text-yellow-400"
            }`}
          >
            <div>
              <strong>Arquivo:</strong> formulario-com-anexo.pdf
            </div>
            <div>
              <strong>Status:</strong>
              {formPdfBytes ? "Pronto para envio" : "Realize o merge primeiro"}
            </div>
            {formPdfBytes && (
              <div>
                <strong>Tamanho:</strong>
                {(formPdfBytes.length / 1024).toFixed(2)} KB
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSending || !formPdfBytes}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSending
            ? "📧 Enviando Email..."
            : "📧 Enviar PDF Mesclado por Email"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { devLog } from "~/utils/dev-log";

interface EmailSenderProps {
  defaultRecipient?: string;
  onEmailSent?: (result: any) => void;
}

export default function EmailSender({
  defaultRecipient = "henrique.danielb@gmail.com",
  onEmailSent,
}: EmailSenderProps) {
  const [emailData, setEmailData] = useState({
    to: defaultRecipient,
    subject: "",
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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailData.to || !emailData.subject || !emailData.message) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSending(true);

    try {
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
              <div style="white-space: pre-wrap;">${emailData.message}</div>
              <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 5px;">
                <p style="margin: 0; color: #6b7280;">Email enviado via T-App</p>
              </div>
            </div>
          `,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar email");
      }

      onEmailSent?.(result);
      alert("Email enviado com sucesso!");

      // Limpar formulário
      setEmailData((prev) => ({ ...prev, subject: "", message: "" }));
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
        Envio de Email
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
            placeholder="Digite o assunto do email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mensagem *
          </label>
          <textarea
            name="message"
            value={emailData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite sua mensagem"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSending ? "📧 Enviando..." : "📧 Enviar Email"}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          <strong>Destinatário padrão:</strong> {defaultRecipient}
        </p>
      </div>
    </div>
  );
}

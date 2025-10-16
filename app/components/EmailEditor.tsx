import { useState } from "react";

interface EmailEditorProps {
  onEmailUpdate?: (emailData: {
    from: string;
    to: string;
    subject: string;
    body: string;
  }) => void;
}

export default function EmailEditor({ onEmailUpdate }: EmailEditorProps) {
  const [emailData, setEmailData] = useState({
    from: "",
    to: "",
    subject: "",
    body: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newData = {
      ...emailData,
      [name]: value,
    };

    setEmailData(newData);
    onEmailUpdate?.(newData);
  };

  const handleInsertTemplate = (template: string) => {
    const newBody = emailData.body + template;
    const newData = { ...emailData, body: newBody };
    setEmailData(newData);
    onEmailUpdate?.(newData);
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Editor de Email
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              De (Remetente)
            </label>
            <input
              type="email"
              name="from"
              value={emailData.from}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="remetente@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Para (Destinatário)
            </label>
            <input
              type="email"
              name="to"
              value={emailData.to}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="destinatario@exemplo.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assunto
          </label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Assunto do email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Corpo do Email
          </label>
          <textarea
            name="body"
            value={emailData.body}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite o conteúdo do email..."
          />
        </div>

        {/* Templates Rápidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Templates Rápidos:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleInsertTemplate("\n\nAtenciosamente,\n[Seu Nome]")
              }
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Assinatura
            </button>
            <button
              type="button"
              onClick={() =>
                handleInsertTemplate("\n\nPor favor, confirme o recebimento.")
              }
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Confirmação
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate("\n\nAguardo seu retorno.")}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Aguardando Retorno
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Preview do Email:
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="space-y-2 text-sm">
              <div>
                <strong>De:</strong> {emailData.from || "[Não definido]"}
              </div>
              <div>
                <strong>Para:</strong> {emailData.to || "[Não definido]"}
              </div>
              <div>
                <strong>Assunto:</strong>{" "}
                {emailData.subject || "[Não definido]"}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <strong>Corpo:</strong>
                <p className="mt-1 whitespace-pre-wrap">
                  {emailData.body || "[Nenhum conteúdo]"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

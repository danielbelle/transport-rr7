import { useState } from "react";

interface LiveFormProps {
  onFormSubmit?: (data: {
    nome: string;
    email: string;
    mensagem: string;
  }) => void;
}

export default function LiveForm({ onFormSubmit }: LiveFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    onFormSubmit?.(formData);

    // Reset após 3 segundos
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Formulário com Preview em Tempo Real
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite seu email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensagem *
            </label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite sua mensagem"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Enviar Formulário
          </button>
        </form>

        {/* Preview em Tempo Real */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preview em Tempo Real
          </h3>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="space-y-3">
              <div>
                <strong className="text-gray-700 dark:text-gray-300">
                  Nome:
                </strong>
                <p className="text-gray-900 dark:text-white mt-1">
                  {formData.nome || "[Não preenchido]"}
                </p>
              </div>

              <div>
                <strong className="text-gray-700 dark:text-gray-300">
                  Email:
                </strong>
                <p className="text-gray-900 dark:text-white mt-1">
                  {formData.email || "[Não preenchido]"}
                </p>
              </div>

              <div>
                <strong className="text-gray-700 dark:text-gray-300">
                  Mensagem:
                </strong>
                <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                  {formData.mensagem || "[Não preenchido]"}
                </p>
              </div>
            </div>
          </div>

          {isSubmitted && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-green-700 dark:text-green-300 font-medium">
                ✓ Formulário enviado com sucesso!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import type { FormProps, FormData } from "~/utils/types";

export default function Form({ onFormDataChange, initialData }: FormProps) {
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      text_nome: "",
      text_rg: "",
      text_cpf: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value,
    };

    setFormData(newData);
    // Notificar imediatamente a mudança (sem debounce aqui)
    onFormDataChange?.(newData);
  };

  // Notificar mudanças iniciais
  useEffect(() => {
    onFormDataChange?.(formData);
  }, []);

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Formulário de Dados
      </h2>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            name="text_nome"
            value={formData.text_nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite seu nome completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            RG *
          </label>
          <input
            type="text"
            name="text_rg"
            value={formData.text_rg}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite seu RG"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CPF *
          </label>
          <input
            type="text"
            name="text_cpf"
            value={formData.text_cpf}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Digite seu CPF"
            required
          />
        </div>
      </form>

      {/* Informações do Formulário */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Dados Preenchidos:
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <div>
            <strong>Nome:</strong> {formData.text_nome || "[Não preenchido]"}
          </div>
          <div>
            <strong>RG:</strong> {formData.text_rg || "[Não preenchido]"}
          </div>
          <div>
            <strong>CPF:</strong> {formData.text_cpf || "[Não preenchido]"}
          </div>
        </div>
      </div>
    </div>
  );
}

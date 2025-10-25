import { useState, useEffect } from "react";
import { FormInput } from "~/components/ui/FormInput";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";
import type { FormProps, FormData, FlexibleFormData } from "~/lib/types";
import { useDocumentStore } from "~/lib/stores";

export default function HomeForm({ onFormDataChange, initialData }: FormProps) {
  const [formData, setFormData] = useState<FlexibleFormData>({
    text_nome: initialData?.text_nome || "",
    text_rg: initialData?.text_rg || "",
    text_cpf: initialData?.text_cpf || "",
    text_universidade: initialData?.text_universidade || "",
    text_semestre: initialData?.text_semestre || "",
    text_curso: initialData?.text_curso || "",
    text_mes: initialData?.text_mes || "",
    text_dias: initialData?.text_dias || "",
    text_cidade: initialData?.text_cidade || "",
    text_email: initialData?.text_email || "",
    signature: initialData?.signature || "",
    text_repete: initialData?.text_repete || "",
  });

  const [isFormComplete, setIsFormComplete] = useState(false);
  const { setCurrentStep } = useDocumentStore();

  // ✅ Reset do formulário quando initialData mudar para vazio
  useEffect(() => {
    if (
      initialData &&
      !initialData.text_nome &&
      !initialData.text_rg &&
      !initialData.text_cpf
    ) {
      setFormData({
        text_nome: "",
        text_rg: "",
        text_cpf: "",
        text_universidade: "",
        text_semestre: "",
        text_curso: "",
        text_mes: "",
        text_dias: "",
        text_cidade: "",
        text_email: "",
        signature: "",
        text_repete: "",
      });
    }
  }, [initialData]);

  // ✅ Validar formulário sempre que formData mudar
  useEffect(() => {
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
    ];

    const isComplete = requiredFields.every(
      (field) => formData[field]?.toString().trim() !== ""
    );

    setIsFormComplete(isComplete);
  }, [formData]);

  const handleFieldChange = (fieldKey: string, value: string) => {
    console.log(`🔄 Campo alterado: ${fieldKey} = "${value}"`);

    const newData = {
      ...formData,
      [fieldKey]: value,
    };

    // ✅ CORREÇÃO: Se estiver alterando o nome, atualiza também o text_repete
    if (fieldKey === "text_nome") {
      newData.text_repete = value;
      console.log(`✅ text_repete atualizado para: "${value}"`);
    }

    setFormData(newData);

    // ✅ CORREÇÃO: Garantir que todos os dados são enviados para o pai
    const formDataToSend: FormData = {
      text_nome: newData.text_nome,
      text_rg: newData.text_rg,
      text_cpf: newData.text_cpf,
      text_universidade: newData.text_universidade,
      text_semestre: newData.text_semestre,
      text_curso: newData.text_curso,
      text_mes: newData.text_mes,
      text_dias: newData.text_dias,
      text_cidade: newData.text_cidade,
      text_email: newData.text_email,
      text_repete: newData.text_repete, // ✅ Agora sempre enviado
      signature: newData.signature,
    };

    console.log("📤 Enviando para pai:", {
      text_nome: formDataToSend.text_nome,
      text_repete: formDataToSend.text_repete,
    });

    onFormDataChange?.(formDataToSend);
  };

  // ✅ Inicializar com dados atuais
  useEffect(() => {
    const initialFormData: FormData = {
      text_nome: formData.text_nome,
      text_rg: formData.text_rg,
      text_cpf: formData.text_cpf,
      text_universidade: formData.text_universidade,
      text_semestre: formData.text_semestre,
      text_curso: formData.text_curso,
      text_mes: formData.text_mes,
      text_dias: formData.text_dias,
      text_cidade: formData.text_cidade,
      text_email: formData.text_email,
      text_repete: formData.text_repete,
      signature: formData.signature,
    };
    onFormDataChange?.(initialFormData);
  }, []);

  // Filtrar campos visíveis (excluir campos hidden e assinatura)
  const visibleFields = homeFieldConfig.filter(
    (field) => !field.hidden && field.type !== "signature"
  );

  // Agrupar campos em seções para melhor organização
  const personalFields = visibleFields.filter((field) =>
    ["text_nome", "text_rg", "text_cpf", "text_email"].includes(field.key)
  );

  const academicFields = visibleFields.filter((field) =>
    ["text_universidade", "text_curso", "text_semestre"].includes(field.key)
  );

  const documentFields = visibleFields.filter((field) =>
    ["text_mes", "text_dias", "text_cidade"].includes(field.key)
  );

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Formulário de Auxílio Transporte
      </h2>

      {/* ✅ DEBUG: Mostrar status do text_repete */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          🔍 Debug text_repete
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <p>
            <strong>text_nome:</strong> {formData.text_nome || "vazio"}
          </p>
          <p>
            <strong>text_repete (local):</strong>{" "}
            {formData.text_repete || "vazio"}
          </p>
          <p>
            <strong>text_repete === text_nome:</strong>{" "}
            {formData.text_repete === formData.text_nome ? "✅ SIM" : "❌ NÃO"}
          </p>
        </div>
      </div>

      <form className="space-y-8">
        {/* Seção: Dados Pessoais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            📋 Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalFields.map((field) => (
              <FormInput
                key={field.key}
                field={field}
                value={formData[field.key] || ""}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        {/* Seção: Dados Acadêmicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            🎓 Dados Acadêmicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {academicFields.map((field) => (
              <FormInput
                key={field.key}
                field={field}
                value={formData[field.key] || ""}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        {/* Seção: Dados do Documento */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            📄 Dados do Documento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documentFields.map((field) => (
              <FormInput
                key={field.key}
                field={field}
                value={formData[field.key] || ""}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        {/* ✅ BOTÃO INTEGRADO NO FORMULÁRIO */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setCurrentStep("email")}
            disabled={!isFormComplete}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isFormComplete
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {isFormComplete
              ? "📧 Continuar para Envio por Email"
              : "⏳ Preencha todos os campos para continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { FormInput } from "~/components/ui/FormInput";
import { FormSignature } from "~/components/ui/FormSignature";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";
import type { FormProps, FormData, FlexibleFormData } from "~/lib/types";

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

  // ✅ Reset do formulário quando initialData mudar para vazio
  useEffect(() => {
    if (
      initialData &&
      !initialData.text_nome &&
      !initialData.text_rg &&
      !initialData.text_cpf &&
      !initialData.signature
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

  // ✅ Preencher automaticamente o campo text_repete quando nome for digitado
  useEffect(() => {
    if (formData.text_nome && formData.text_nome.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        text_repete: formData.text_nome,
      }));
    }
  }, [formData.text_nome]);

  const handleFieldChange = (fieldKey: string, value: string) => {
    const newData = {
      ...formData,
      [fieldKey]: value,
    };

    // Se estiver alterando o nome, atualiza também o text_repete
    if (fieldKey === "text_nome" && value.trim() !== "") {
      newData.text_repete = value;
    }

    setFormData(newData);

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
      text_repete: newData.text_repete,
      signature: newData.signature,
    };
    onFormDataChange?.(formDataToSend);
  };

  const handleSignatureChange = (
    fieldKey: string,
    signatureData: string | null
  ) => {
    const newData = {
      ...formData,
      [fieldKey]: signatureData || "",
    };
    setFormData(newData);

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
      text_repete: newData.text_repete,
      signature: newData.signature,
    };
    onFormDataChange?.(formDataToSend);
  };

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

  // Filtrar campos visíveis (excluir campos hidden)
  const visibleFields = homeFieldConfig.filter((field) => !field.hidden);

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

  const signatureFields = visibleFields.filter(
    (field) => field.type === "signature"
  );

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Formulário de Auxílio Transporte
      </h2>

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

        {/* Seção: Assinatura */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            ✍️ Assinatura
          </h3>
          {signatureFields.map((field) => (
            <FormSignature
              key={field.key}
              field={field}
              onSignatureChange={handleSignatureChange}
              initialSignature={formData.signature} // ✅ Passa a assinatura existente
            />
          ))}
        </div>
      </form>
    </div>
  );
}

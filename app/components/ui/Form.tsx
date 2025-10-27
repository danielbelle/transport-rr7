import React from "react";
import { FormField } from "~/components/ui/FormField";
import type { TappFormData, FieldConfig } from "~/lib/types";

interface FormProps {
  fields: FieldConfig[];
  formData: TappFormData;
  onFormDataChange: (data: TappFormData) => void;
  children?: React.ReactNode;
}

export default function Form({
  fields,
  formData,
  onFormDataChange,
  children,
}: FormProps) {
  const handleFieldChange = (fieldKey: string, value: string) => {
    const newData = { ...formData, [fieldKey]: value };

    if (fieldKey === "text_nome") {
      newData.text_repete = value;
    }

    onFormDataChange(newData);
  };

  const personalFields = fields.filter((field) =>
    ["text_nome", "text_rg", "text_cpf", "text_email"].includes(field.key)
  );

  const academicFields = fields.filter((field) =>
    ["text_universidade", "text_curso", "text_semestre"].includes(field.key)
  );

  const documentFields = fields.filter((field) =>
    ["text_mes", "text_dias", "text_cidade"].includes(field.key)
  );

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Formulário de Auxílio Transporte
      </h2>

      <form className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalFields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={formData[field.key as keyof TappFormData] || ""}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            Dados Acadêmicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {academicFields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={formData[field.key as keyof TappFormData] || ""}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-2">
            Dados do Documento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documentFields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={formData[field.key as keyof TappFormData] || ""}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        </div>

        {children}
      </form>
    </div>
  );
}

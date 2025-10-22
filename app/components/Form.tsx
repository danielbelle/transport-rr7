import { useState, useEffect } from "react";
import { FormInput } from "~/components/ui/FormInput";
import { FormSignature } from "~/components/ui/FormSignature";
import { fieldConfig } from "~/utils/fieldConfig";
import type { FormProps, FormData, FlexibleFormData } from "~/utils/types";

export default function Form({ onFormDataChange, initialData }: FormProps) {
  // Inicializar com valores padrão que satisfazem FlexibleFormData
  const [formData, setFormData] = useState<FlexibleFormData>({
    text_nome: initialData?.text_nome || "",
    text_rg: initialData?.text_rg || "",
    text_cpf: initialData?.text_cpf || "",
    signature: initialData?.signature || "",
  });

  const handleFieldChange = (fieldKey: string, value: string) => {
    const newData = {
      ...formData,
      [fieldKey]: value,
    };

    setFormData(newData);

    // Converter para FormData antes de notificar
    const formDataToSend: FormData = {
      text_nome: newData.text_nome,
      text_rg: newData.text_rg,
      text_cpf: newData.text_cpf,
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

    // Converter para FormData antes de notificar
    const formDataToSend: FormData = {
      text_nome: newData.text_nome,
      text_rg: newData.text_rg,
      text_cpf: newData.text_cpf,
      signature: newData.signature,
    };
    onFormDataChange?.(formDataToSend);
  };

  // Notificar mudanças iniciais
  useEffect(() => {
    const initialFormData: FormData = {
      text_nome: formData.text_nome,
      text_rg: formData.text_rg,
      text_cpf: formData.text_cpf,
      signature: formData.signature,
    };
    onFormDataChange?.(initialFormData);
  }, []);

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Formulário de Dados
      </h2>

      <form className="space-y-6">
        {fieldConfig
          .filter((field) => !field.hidden)
          .map((field) => {
            if (field.type === "signature") {
              return (
                <FormSignature
                  key={field.key}
                  field={field}
                  onSignatureChange={handleSignatureChange}
                />
              );
            }

            return (
              <FormInput
                key={field.key}
                field={field}
                value={formData[field.key] || ""}
                onChange={handleFieldChange}
              />
            );
          })}
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
          <div>
            <strong>Assinatura:</strong>{" "}
            {formData.signature ? "✓ Preenchida" : "[Não assinado]"}
          </div>
        </div>
      </div>
    </div>
  );
}

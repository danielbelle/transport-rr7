import { useState, useEffect } from "react";
import type { TappFormData, FieldConfig } from "~/lib/types";
import { validateFormData } from "~/lib/utils";

export function useForm(initialData: TappFormData, fieldConfig: FieldConfig[]) {
  const [formData, setFormData] = useState<TappFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormComplete, setIsFormComplete] = useState(false);

  // validação manual por Zod
  const validateField = (field: FieldConfig, value: string): string => {
    if (field.required && (!value || value.trim() === "")) {
      return `${field.label} é obrigatório`;
    }

    // Validar usando Zod para campos específicos
    const tempData = { ...formData, [field.key]: value };
    const result = validateFormData(tempData);

    if (!result.success) {
      const fieldError = result.errors.find(
        (error) =>
          error.toLowerCase().includes(field.label.toLowerCase()) ||
          error.toLowerCase().includes(field.key.toLowerCase())
      );
      return fieldError || "";
    }

    return "";
  };

  // validateForm para usar Zod
  const validateForm = (): boolean => {
    const result = validateFormData(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.errors.forEach((error) => {
        // Mapeamento mais eficiente
        const fieldMap: Record<string, string> = {
          Nome: "text_nome",
          RG: "text_rg",
          CPF: "text_cpf",
          Email: "text_email",
          Universidade: "text_universidade",
          Semestre: "text_semestre",
          Curso: "text_curso",
          Mês: "text_mes",
          Dias: "text_dias",
          Cidade: "text_cidade",
          Assinatura: "signature",
        };

        Object.entries(fieldMap).forEach(([key, fieldKey]) => {
          if (error.includes(key)) newErrors[fieldKey] = error;
        });
      });

      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const updateField = (key: string, value: string) => {
    const newData = { ...formData, [key]: value };

    if (key === "text_nome") {
      newData.text_repete = value;
    }

    setFormData(newData);

    const field = fieldConfig.find((f) => f.key === key);
    if (field) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [key]: error,
      }));
    }

    return newData as TappFormData;
  };

  useEffect(() => {
    const requiredFields = fieldConfig
      .filter((field) => field.required && field.type !== "signature")
      .map((field) => field.key);

    const isComplete = requiredFields.every((field) => {
      // Type guard para acesso seguro
      if (field in formData) {
        const value = formData[field as keyof TappFormData]?.toString().trim();
        return value !== "";
      }
      return false;
    });

    setIsFormComplete(isComplete);
  }, [formData, fieldConfig]);

  return {
    formData: formData as TappFormData,
    errors,
    isFormComplete,
    updateField,
    validateForm,
    setFormData: (data: TappFormData) => setFormData(data as TappFormData),
  };
}

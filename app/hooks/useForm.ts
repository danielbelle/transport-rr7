import { useState, useEffect } from "react";
import type { FormData, FlexibleFormData, FieldConfig } from "~/lib/types";
import { validateFormData } from "~/lib/validation"; // ← IMPORTAR validação Zod

export function useForm(initialData: FormData, fieldConfig: FieldConfig[]) {
  const [formData, setFormData] = useState<FlexibleFormData>(
    initialData as FlexibleFormData
  );
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
      // Converter erros do Zod para o formato do estado
      const newErrors: Record<string, string> = {};
      result.errors.forEach((error) => {
        // Mapear mensagens de erro para campos específicos
        if (error.includes("Nome")) newErrors.text_nome = error;
        else if (error.includes("RG")) newErrors.text_rg = error;
        else if (error.includes("CPF")) newErrors.text_cpf = error;
        else if (error.includes("Email")) newErrors.text_email = error;
        else if (error.includes("Universidade"))
          newErrors.text_universidade = error;
        else if (error.includes("Semestre")) newErrors.text_semestre = error;
        else if (error.includes("Curso")) newErrors.text_curso = error;
        else if (error.includes("Mês")) newErrors.text_mes = error;
        else if (error.includes("Dias")) newErrors.text_dias = error;
        else if (error.includes("Cidade")) newErrors.text_cidade = error;
        else if (error.includes("Assinatura")) newErrors.signature = error;
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

    return newData as FormData;
  };

  useEffect(() => {
    const requiredFields = fieldConfig
      .filter((field) => field.required && field.type !== "signature")
      .map((field) => field.key);

    const isComplete = requiredFields.every(
      (field) => formData[field]?.toString().trim() !== ""
    );

    setIsFormComplete(isComplete);
  }, [formData, fieldConfig]);

  return {
    formData: formData as FormData,
    errors,
    isFormComplete,
    updateField,
    validateForm,
    setFormData: (data: FormData) => setFormData(data as FlexibleFormData),
  };
}

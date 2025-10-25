import { useState, useEffect } from "react";
import type { FormData, FlexibleFormData, FieldConfig } from "~/lib/types";

export function useForm(initialData: FormData, fieldConfig: FieldConfig[]) {
  // Agora a conversão é mais simples porque FlexibleFormData extends FormData
  const [formData, setFormData] = useState<FlexibleFormData>(
    initialData as FlexibleFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormComplete, setIsFormComplete] = useState(false);

  const validateField = (field: FieldConfig, value: string): string => {
    if (field.required && (!value || value.trim() === "")) {
      return `${field.label} é obrigatório`;
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Email inválido";
      }
    }

    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fieldConfig.forEach((field) => {
      if (field.required && field.type !== "signature") {
        const error = validateField(field, formData[field.key] || "");
        if (error) {
          newErrors[field.key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
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

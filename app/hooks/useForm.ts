import { useCallback, useEffect, useState } from "react";
import type { TappFormData, FieldConfig } from "~/lib/types";
import { useFormValidation } from "./useFormValidation";
import { useFormState } from "./useFormState";
import { useFormCompleteness } from "./useFormCompleteness";
import { Logger } from "~/lib/utils/logger";

export function useForm(initialData: TappFormData, fieldConfig: FieldConfig[]) {
  const { formData, updateField, resetForm, setFormData } =
    useFormState(initialData);
  const { validateField, validateForm } = useFormValidation(fieldConfig);
  const { isFormComplete, completionPercentage } = useFormCompleteness(
    formData,
    fieldConfig
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação em tempo real
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    fieldConfig.forEach((field) => {
      if (field.required) {
        const value = formData[field.key as keyof TappFormData] || "";
        const error = validateField(field, value);
        if (error) {
          newErrors[field.key] = error;
        }
      }
    });

    setErrors(newErrors);
  }, [formData, fieldConfig, validateField]);

  const handleFieldChange = useCallback(
    (key: string, value: string) => {
      const newData = updateField(key, value);

      // Validação do campo específico
      const field = fieldConfig.find((f) => f.key === key);
      if (field) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [key]: error,
        }));
      }

      return newData;
    },
    [updateField, fieldConfig, validateField]
  );

  return {
    formData,
    errors,
    isFormComplete,
    completionPercentage,
    updateField: handleFieldChange,
    validateForm: () => validateForm(formData),
    resetForm,
    setFormData,
  };
}

import { useCallback, useMemo } from "react";
import type { TappFormData, FieldConfig } from "~/lib/types";

export const useFormCompleteness = (
  formData: TappFormData,
  fieldConfig: FieldConfig[]
) => {
  const isFormComplete = useMemo(() => {
    const requiredFields = fieldConfig
      .filter((field) => field.required && field.type !== "signature")
      .map((field) => field.key);

    return requiredFields.every((field) => {
      if (field in formData) {
        const value = formData[field as keyof TappFormData]?.toString().trim();
        return value !== "";
      }
      return false;
    });
  }, [formData, fieldConfig]);

  const getCompletionPercentage = useCallback(() => {
    const requiredFields = fieldConfig
      .filter((field) => field.required && field.type !== "signature")
      .map((field) => field.key);

    const completedFields = requiredFields.filter((field) => {
      if (field in formData) {
        const value = formData[field as keyof TappFormData]?.toString().trim();
        return value !== "";
      }
      return false;
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData, fieldConfig]);

  return {
    isFormComplete,
    completionPercentage: getCompletionPercentage(),
    getCompletionPercentage,
  };
};

import { useCallback, useState } from "react";
import type { TappFormData } from "~/lib/types";

export const useFormState = (initialData: TappFormData) => {
  const [formData, setFormData] = useState<TappFormData>(initialData);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };

      // Auto-preenchimento do campo de repetição do nome
      if (key === "text_nome") {
        newData.text_repete = value;
      }

      return newData;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  return {
    formData,
    updateField,
    resetForm,
    setFormData,
  };
};

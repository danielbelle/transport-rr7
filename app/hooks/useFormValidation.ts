import { useCallback } from "react";
import type { FieldConfig, TappFormData } from "~/lib/types";
import { validateFormData } from "~/lib/utils";
import { Logger } from "~/lib/utils/logger";

export const useFormValidation = (fieldConfig: FieldConfig[]) => {
  const validateField = useCallback(
    (field: FieldConfig, value: string): string => {
      if (field.required && (!value || value.trim() === "")) {
        return `${field.label} é obrigatório`;
      }

      // Validar usando Zod para campos específicos
      const tempData = { [field.key]: value };
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
    },
    []
  );

  const validateForm = useCallback((formData: TappFormData): boolean => {
    const result = validateFormData(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.errors.forEach((error) => {
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
          if (error.includes(key)) errors[fieldKey] = error;
        });
      });

      Logger.error("Erros de validação do formulário:", errors);
      return false;
    }

    Logger.log("Formulário validado com sucesso");
    return true;
  }, []);

  return {
    validateField,
    validateForm,
  };
};

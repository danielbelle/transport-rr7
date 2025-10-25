import type { FieldConfig } from "~/lib/types";
import { FormInput } from "./Input";
import Form from "./Form";

interface FormFieldProps {
  field: FieldConfig;
  value: string;
  error?: string;
  onChange: (key: string, value: string) => void;
}

export function FormField({ field, value, error, onChange }: FormFieldProps) {
  if (field.hidden) return null;

  const handleChange = (fieldKey: string, newValue: string) => {
    onChange(fieldKey, newValue);
  };

  // Remove a renderização de assinatura - agora só no email
  return <FormInput field={field} value={value} onChange={handleChange} />;
}

import type { FieldConfig } from "~/lib/types";
import { FormInput } from "~/components/ui/FormInput";

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

  return <FormInput field={field} value={value} onChange={handleChange} />;
}

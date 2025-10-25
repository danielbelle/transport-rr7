import React from "react";
import type { FieldConfig } from "~/lib/types";

interface InputProps {
  // Props do Input genérico
  type?: "text" | "number" | "email" | "tel" | "date" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;

  field?: FieldConfig;
}

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder = "",
  label,
  name,
  id,
  required = false,
  disabled = false,
  className = "",
  error,
  field, // Prop opcional para compatibilidade com FormInput
}: InputProps) {
  const inputId = id || name;

  // Se field for fornecido, usa as configurações do field
  const finalLabel = field?.label || label;
  const finalPlaceholder = field?.placeholder || placeholder;
  const finalRequired = field?.required || required;

  return (
    <div className={`flex flex-col ${className}`}>
      {finalLabel && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {finalLabel}
          {finalRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={finalPlaceholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white focus:ring-2 focus:border-transparent 
          transition-colors
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        required={finalRequired}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// Helper para uso como FormInput (mantém compatibilidade)
export function FormInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (fieldKey: string, value: string) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field.key, e.target.value);
  };

  return (
    <Input
      field={field}
      type={
        field.type === "number"
          ? "number"
          : field.type === "email"
          ? "email"
          : "text"
      }
      value={value}
      onChange={handleChange}
      placeholder={field.placeholder}
      required={field.required}
    />
  );
}

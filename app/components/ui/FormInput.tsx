import React, { memo } from "react";
import type { FormInputProps } from "~/lib/types";

export const FormInput = memo(function FormInput({
  field,
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
}: FormInputProps) {
  // Determinar configurações finais
  const finalType =
    field?.type === "number"
      ? "number"
      : field?.type === "email"
      ? "email"
      : type;

  const finalLabel = field?.label || label;
  const finalPlaceholder = field?.placeholder || placeholder;
  const finalRequired = field?.required || required;
  const finalName = field?.key || name || id;
  const finalId = id || field?.key || name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldKey = field?.key || name || id || "unknown";
    onChange(fieldKey, e.target.value);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {finalLabel && (
        <label
          htmlFor={finalId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {finalLabel}
          {finalRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={finalType}
        id={finalId}
        name={finalName}
        value={value}
        onChange={handleChange}
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
});

FormInput.displayName = "FormInput";

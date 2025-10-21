import React from "react";
import type { FieldConfig } from "~/utils/types";

interface FormInputProps {
  field: FieldConfig;
  value: string;
  onChange: (fieldKey: string, value: string) => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  field,
  value,
  onChange,
}) => {
  return (
    <div key={field.key}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {field.label}{" "}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        required={field.required}
      />
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Posição no documento: ({field.x}, {field.y}) | Tamanho da fonte:{" "}
        {field.font}px
      </div>
    </div>
  );
};

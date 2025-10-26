import React from "react";
import type { FieldConfig } from "~/lib/types";

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
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
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
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        required={field.required}
      />
    </div>
  );
}

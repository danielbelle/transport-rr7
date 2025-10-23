import React from "react";
import type { FormInputProps } from "~/utils/types";

export const FormInput: React.FC<FormInputProps> = ({
  field,
  value,
  onChange,
}) => {
  return (
    <div key={field.key}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {field.label}
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
    </div>
  );
};

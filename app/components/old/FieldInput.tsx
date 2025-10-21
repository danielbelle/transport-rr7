import React from "react";
import { SignatureField } from "~/components/old/SignatureField";
import type { FieldInputProps } from "~/utils/types";

export const FieldInput: React.FC<FieldInputProps> = ({
  field,
  formData,
  onChange,
  onSignatureChange,
}) => {
  if (field.type === "signature") {
    return (
      <SignatureField field={field} onSignatureChange={onSignatureChange} />
    );
  }

  return (
    <div key={field.key}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {field.label}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={formData[field.key] || ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Posição: ({field.x}, {field.y}) | Fonte: {field.font}px
      </div>
    </div>
  );
};

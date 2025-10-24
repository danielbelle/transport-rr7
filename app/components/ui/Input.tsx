import React from "react";
import type { JSX } from "react";

interface InputProps {
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
}: InputProps): JSX.Element {
  const inputId = id || name;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

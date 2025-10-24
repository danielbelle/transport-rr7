import React from "react";
import type { JSX } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full mx-4 
          ${sizeClasses[size]} max-h-[90vh] flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Fechar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

Modal.Footer = function ModalFooter({
  children,
  className = "",
}: {
  children: React.ReactNode,
  className?: string,
}): JSX.Element {
  return (
    <div
      className={`flex justify-end p-6 border-t border-gray-200 dark:border-gray-600 gap-3 ${className}`}
    >
      {children}
    </div>
  );
};

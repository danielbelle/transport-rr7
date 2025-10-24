import type { JSX } from "react";

interface LazyLoadingProps {
  component?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LazyLoading({
  component = "Componente",
  message,
  size = "md",
}: LazyLoadingProps): JSX.Element {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`}
    >
      <div className="relative mb-4">
        <div
          className={`border-4 border-gray-200 dark:border-gray-600 rounded-full animate-spin ${
            size === "sm"
              ? "w-8 h-8"
              : size === "md"
              ? "w-12 h-12"
              : "w-16 h-16"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-t-blue-600 rounded-full animate-spin ${
            size === "sm"
              ? "w-8 h-8"
              : size === "md"
              ? "w-12 h-12"
              : "w-16 h-16"
          }`}
        ></div>
      </div>

      <div className="text-center">
        <p
          className={`font-medium text-gray-700 dark:text-gray-300 mb-2 ${textSizes[size]}`}
        >
          Carregando {component}...
        </p>
        {message && (
          <p
            className={`text-gray-500 dark:text-gray-400 ${
              size === "sm" ? "text-xs" : "text-sm"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <div className="flex space-x-1 mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function PdfLoading(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-6xl mb-4 animate-pulse">📄</div>
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
        Carregando Visualizador PDF
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
        Preparando o visualizador de documentos...
      </p>
    </div>
  );
}

export function FormLoading(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-3 animate-bounce">📝</div>
      <h3 className="font-medium text-gray-800 dark:text-white mb-1">
        Carregando Formulário
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
        Preparando campos de edição...
      </p>
    </div>
  );
}

export function EmailLoading(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-3 animate-pulse">📧</div>
      <h3 className="font-medium text-gray-800 dark:text-white mb-1">
        Carregando Seção de Email
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-xs text-center">
        Preparando envio...
      </p>
    </div>
  );
}

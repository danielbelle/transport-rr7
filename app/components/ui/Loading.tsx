interface LoadingProps {
  variant?: "spinner" | "dots" | "progress" | "pulse";
  type?: "page" | "component" | "email" | "pdf" | "form";
  size?: "sm" | "md" | "lg";
  message?: string;
  title?: string;
  progress?: number;
  overlay?: boolean;
  centered?: boolean;
}

export default function Loading({
  variant = "spinner",
  type = "component",
  size = "md",
  message,
  title,
  progress,
  overlay = false,
  centered = true,
}: LoadingProps) {
  const config = {
    page: {
      defaultTitle: "Carregando Editor",
      defaultMessage: "Preparando o ambiente completo para sua edição...",
      icon: "📝",
    },
    email: {
      defaultTitle: "Enviando Email",
      defaultMessage: "Estamos processando seu envio...",
      icon: "📧",
    },
    pdf: {
      defaultTitle: "Carregando Visualizador PDF",
      defaultMessage: "Preparando o visualizador de documentos...",
      icon: "📄",
    },
    form: {
      defaultTitle: "Carregando Formulário",
      defaultMessage: "Preparando campos de edição...",
      icon: "📝",
    },
    component: {
      defaultTitle: "Carregando",
      defaultMessage: "Preparando tudo para sua edição...",
      icon: "🚀",
    },
  };

  const { defaultTitle, defaultMessage, icon } = config[type];

  const sizeClasses = {
    sm: "max-w-sm p-6",
    md: "max-w-md p-8",
    lg: "max-w-lg p-10",
  };

  const loadingContent = (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 ${sizeClasses[size]} w-full mx-4`}
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            {variant === "spinner" && (
              <div
                className={`border-4 border-gray-200 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin ${
                  size === "sm"
                    ? "w-8 h-8"
                    : size === "md"
                    ? "w-12 h-12"
                    : "w-16 h-16"
                }`}
              ></div>
            )}
            {variant === "pulse" && (
              <div className="text-4xl animate-pulse">{icon}</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2
            className={`font-bold text-gray-800 dark:text-white ${
              size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg"
            }`}
          >
            {title || defaultTitle}
          </h2>
          <p
            className={`text-gray-600 dark:text-gray-300 ${
              size === "lg" ? "text-lg" : "text-base"
            }`}
          >
            {message || defaultMessage}
          </p>
        </div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {variant === "dots" && (
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${
          centered ? "" : "items-start pt-20"
        }`}
      >
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
}

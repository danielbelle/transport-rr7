import type { JSX } from "react";

interface UnifiedLoadingProps {
  variant?: "email" | "fullpage" | "navigation";
  title?: string;
  message?: string;
  currentStep?: number;
  totalSteps?: number;
  size?: "sm" | "md" | "lg";
  overlay?: boolean;
  centered?: boolean;
}

export default function UnifiedLoading({
  variant = "fullpage",
  title,
  message,
  currentStep = 1,
  totalSteps = 3,
  size = "md",
  overlay = true,
  centered = true,
}: UnifiedLoadingProps): JSX.Element {
  const variantConfig = {
    email: {
      defaultTitle: "Enviando Email",
      defaultMessage: "Estamos processando seu envio...",
      icon: "📧",
      showSteps: true,
      showProgress: true,
    },
    fullpage: {
      defaultTitle: "Carregando Editor",
      defaultMessage: "Preparando o ambiente completo para sua edição...",
      icon: "📝",
      showSteps: false,
      showProgress: false,
    },
    navigation: {
      defaultTitle: "Carregando",
      defaultMessage: "Preparando tudo para sua edição...",
      icon: "🚀",
      showSteps: false,
      showProgress: false,
    },
  };

  const config = variantConfig[variant];
  const progress = (currentStep / totalSteps) * 100;

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
            {variant === "email" ? (
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full">
                <div className="w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-2xl">{config.icon}</span>
                </div>
              </div>
            ) : variant === "fullpage" ? (
              <div className="w-24 h-24 border-4 border-blue-100 dark:border-blue-900 rounded-full">
                <div className="w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-3xl animate-bounce">{config.icon}</div>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2
            className={`font-bold text-gray-800 dark:text-white ${
              size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg"
            } ${variant === "fullpage" ? "animate-pulse" : ""}`}
          >
            {title || config.defaultTitle}
          </h2>
          <p
            className={`text-gray-600 dark:text-gray-300 ${
              size === "lg" ? "text-lg" : "text-base"
            }`}
          >
            {message || config.defaultMessage}
          </p>
        </div>

        {config.showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {currentStep} de {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {config.showSteps && (
          <div className="space-y-2 text-left">
            {[
              "Gerando documento...",
              "Preparando anexos...",
              "Enviando...",
            ].map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 text-sm ${
                  index < currentStep
                    ? "text-green-600 dark:text-green-400"
                    : index === currentStep
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    index < currentStep
                      ? "bg-green-500 animate-pulse"
                      : index === currentStep
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {variant === "fullpage" && (
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

        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          {variant === "email" && "Não feche esta página até a confirmação"}
          {variant === "fullpage" && "Isso só acontece na primeira vez..."}
          {variant === "navigation" &&
            "✨ Seu progresso será salvo automaticamente"}
        </div>
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

import { useNavigate } from "react-router";
import LogoComponent from "~/components/layout/logo-component";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import type { JSX } from "react";

interface WelcomeProps {
  title?: string;
  subtitle?: string;
  actionButton?: string;
  onAction?: () => void;
}

export default function Welcome({
  title = "Editor de Auxílio Transporte",
  subtitle = "Preencha o formulário, que seu documento será gerado automaticamente.",
  actionButton = "Começar Agora",
  onAction,
}: WelcomeProps): JSX.Element {
  const navigate = useNavigate();

  const handleAction = (): void => {
    // Chama a função personalizada se fornecida, caso contrário usa navegação padrão
    if (onAction) {
      onAction();
    } else {
      navigate("/edit");
    }
  };

  return (
    <main className="flex items-center justify-center pt-7 pb-4 min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex-1 flex flex-col items-center gap-12 max-w-4xl mx-auto px-4">
        <header className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
              {title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              {subtitle}
            </p>
          </div>
        </header>

        <div className="w-full max-w-md">
          <Card className="hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
                Começar Edição
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Acesse o editor para preencher seu auxílio transporte
              </p>
            </div>

            <Button
              onClick={handleAction}
              className="w-full py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{actionButton}</span>
                <span>→</span>
              </span>
            </Button>
          </Card>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sistema para edição de documentos de auxílio transporte.
          </p>
        </div>
      </div>
    </main>
  );
}

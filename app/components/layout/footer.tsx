// app/components/layout/footer.tsx
import type { JSX } from "react";
import { Link } from "react-router";

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {new Date().getFullYear()} TAPP
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Sistema para edição de auxílio transporte
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="https://github.com/danielbelle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub de Daniel Henrique Bellé"
              className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
            >
              Desenvolvido por Daniel Henrique Bellé
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

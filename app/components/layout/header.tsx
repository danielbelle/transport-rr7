import { Link, useLocation } from "react-router";
import LogoComponent from "~/components/layout/logo-component";
import type { JSX } from "react";

export default function Header(): JSX.Element {
  const location = useLocation();
  const isRoot = location.pathname === "/";
  const isEdit = location.pathname === "/edit";

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <LogoComponent className="w-[110px] max-w-[80vw]" />
          <nav className="flex items-center gap-4">
            {isRoot ? (
              <Link
                to="/edit"
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Edição
              </Link>
            ) : isEdit ? (
              <Link
                to="/"
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Início
              </Link>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Início
                </Link>
                <Link
                  to="/edit"
                  className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Edição
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

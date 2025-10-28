import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteDevServer } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
      {
        name: "ignore-chrome-devtools",
        configureServer(server: ViteDevServer) {
          server.middlewares.use((req, res, next) => {
            if (
              req.url?.includes(".well-known/appspecific/com.chrome.devtools")
            ) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({}));
              return;
            }
            next();
          });
        },
      },
    ],
    define: {
      // Define variáveis de ambiente para o cliente
      "import.meta.env.VITE_EMAIL_PREFERITO": JSON.stringify(
        env.VITE_EMAIL_PREFERITO
      ),
      "import.meta.env.VITE_VALIDATION_ENABLED": JSON.stringify(
        env.VITE_VALIDATION_ENABLED
      ),
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  };
});

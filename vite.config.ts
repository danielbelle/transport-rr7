import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteDevServer } from "vite";

export default defineConfig({
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
});

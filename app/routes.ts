import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // Adicione esta linha para capturar todas as rotas desconhecidas
  { path: "/*", file: "routes/catch-all.tsx" },
] satisfies RouteConfig;

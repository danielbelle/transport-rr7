import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/main.tsx"),
  route("/home", "routes/home.tsx"),
  route("/api/send-email", "routes/api.send-email.ts"),
  // Adicione esta linha para capturar todas as rotas desconhecidas
  route("/*", "routes/catch-all.tsx"),
] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/welcome/route.tsx"),
  route("/edit", "routes/_index/route.tsx"),
  route("/api/send-email", "routes/api.send-email/route.ts"),
  route("/*", "routes/catch-all/route.tsx"),
] satisfies RouteConfig;

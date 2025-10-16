import type { Route } from "./+types/catch-all";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  // Ignora silenciosamente as URLs de devtools
  if (url.pathname.includes(".well-known/appspecific/com.chrome.devtools")) {
    return new Response("", { status: 200 });
  }

  // Para outras URLs desconhecidas, você pode redirecionar para home
  // ou retornar uma página 404
  return redirect("/");
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Page Not Found" }];
}

export default function CatchAll() {
  return null; // Componente vazio pois o loader já trata tudo
}

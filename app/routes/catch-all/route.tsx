import { redirect } from "react-router";

interface Route {
  LoaderArgs: {
    request: Request;
  };
  MetaArgs: {};
}

export async function loader({ request }: Route["LoaderArgs"]) {
  const url = new URL(request.url);

  if (url.pathname.includes(".well-known/appspecific/com.chrome.devtools")) {
    return new Response("", { status: 200 });
  }

  return redirect("/");
}

export function meta({}: Route["MetaArgs"]) {
  return [{ title: "Page Not Found" }];
}

export default function CatchAll() {
  return null;
}

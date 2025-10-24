import { Resend } from "resend";
import type { ActionFunctionArgs } from "react-router";
import { env } from "~/lib/env";

// Inicializa o cliente Resend com env validado
const resend = new Resend(env.RESEND_API_KEY);

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();

    // Validação adicional do payload
    if (!formData.to || !formData.subject || !formData.html) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos no payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "T-App <onboarding@resend.dev>",
      to: formData.to,
      subject: formData.subject,
      html: formData.html,
      attachments: formData.attachments || [],
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

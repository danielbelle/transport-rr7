import { Resend } from "resend";
import type { ActionFunctionArgs } from "react-router";
import { validateEmailData, env } from "~/lib/utils";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();

    // Validação com Zod (sempre ativa no servidor)
    const validationResult = validateEmailData(formData);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: validationResult.errors.join(", ") }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Inicializa o cliente Resend apenas no servidor
    const resend = new Resend(env.RESEND_API_KEY);

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

import { Resend } from "resend";
import type { ActionFunctionArgs } from "react-router";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error("API não configurada");
}
const resend = new Resend(resendApiKey);

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();
    const { data, error } = await resend.emails.send({
      from: "T-App <onboarding@resend.dev>",
      to: formData.to,
      subject: formData.subject,
      html: formData.html,
      attachments: formData.attachments,
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

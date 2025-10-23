import { Resend } from "resend";
import type { ActionFunctionArgs } from "react-router";

// Acessa a variável de ambiente diretamente
const resendApiKey = process.env.RESEND_API_KEY;
// Verifica se a chave da API está configurada
if (!resendApiKey) {
  throw new Error("API não configurada");
}
// Inicializa o cliente Resend
const resend = new Resend(resendApiKey);
// Rota para envio de email via Resend
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Lê os dados do corpo da requisição
    const formData = await request.json();
    // Envia o email usando o Resend
    const { data, error } = await resend.emails.send({
      from: "T-App <onboarding@resend.dev>",
      to: formData.to,
      subject: formData.subject,
      html: formData.html,
      attachments: formData.attachments,
    });
    // Trata erros específicos do Resend
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Retorna sucesso se o email foi enviado
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Trata erros gerais
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

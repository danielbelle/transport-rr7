import type { ActionFunctionArgs } from "react-router";
import { validateEmailData, smtpConfig } from "~/lib/utils";
import nodemailer from "nodemailer";

// Interface para os dados do email
interface EmailData {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
    encoding: string;
  }>;
}

// Criar transporter SMTP
function createTransporter() {
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465, // true para 465, false para outras portas
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();

    // Validação com Zod (mantida do sistema original)
    const validationResult = validateEmailData(formData);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: validationResult.errors.join(", ") }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailData: EmailData = formData;

    // Criar transporter SMTP
    const transporter = createTransporter();

    // Configurar opções do email
    const mailOptions = {
      from: smtpConfig.from,
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject,
      html: emailData.html,
      attachments:
        emailData.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          encoding: attachment.encoding as "base64",
          contentType: attachment.contentType,
        })) || [],
    };

    // Verificar conexão SMTP
    try {
      await transporter.verify();
    } catch (verifyError) {
      return new Response(
        JSON.stringify({
          error: `Falha na conexão SMTP: ${
            verifyError instanceof Error
              ? verifyError.message
              : "Erro desconhecido"
          }`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return new Response(
      JSON.stringify({
        error: `Falha no envio do email: ${errorMessage}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

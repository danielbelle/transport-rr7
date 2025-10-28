// app/routes/editor/utils/email-utils.ts

import type { TappFormData } from "~/lib/types";

/**
 * Templates de email específicos para a home
 */
export const HomeEmailTemplates = {
  formEmail: (subject: string, formData: TappFormData, p0: boolean) => {
    // Máscara: mostra 3 primeiros e 2 últimos caracteres, resto vira '*'
    const maskMiddle = (value?: string) => {
      if (!value) return "Não informado";
      const s = String(value);
      if (s.length <= 5) {
        // se muito curto, mascara tudo exceto os últimos 2 (quando possível)
        return s.replace(/.(?=.{2})/g, "*");
      }
      const first = s.slice(0, 3);
      const last = s.slice(-2);
      const middle = "*".repeat(Math.max(0, s.length - 5));
      return `${first}${middle}${last}`;
    };

    const maskedCPF = maskMiddle(formData.text_cpf);
    const maskedRG = maskMiddle(formData.text_rg);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .student-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .message { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .attachments { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    .badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 15px; font-size: 14px; }
    .attachment-item { background: white; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #10b981; }
    .formatted-field { background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .warning { background: #fef3c7; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #f59e0b; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    td:first-child { width: 35%; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 Comprovante de Auxílio Transporte</h1>
    <p>Sistema TAPP - Envio Automático</p>
  </div>
  
  <div class="content">
    <div class="badge">🎓 Auxílio Transporte</div>
    
    <div class="student-info">
      <h3 style="color: #374151; margin-top: 0;">Dados do Estudante:</h3>
      <table>
        <tr>
          <td>Nome:</td>
          <td>${formData.text_nome || "Não informado"}</td>
        </tr>
        <tr>
          <td>RG:</td>
          <td>${maskedRG}</td>
        </tr>
        <tr>
          <td>CPF:</td>
          <td>${maskedCPF}</td>
        </tr>
        <tr>
          <td>Universidade:</td>
          <td>${formData.text_universidade || "Não informado"}</td>
        </tr>
        <tr>
          <td>Curso:</td>
          <td>${formData.text_curso || "Não informado"}</td>
        </tr>
        <tr>
          <td>Semestre:</td>
          <td>
            ${
              formData.text_semestre
                ? `<span class="formatted-field">${formData.text_semestre}</span>`
                : "N/I"
            }
          </td>
        </tr>
        <tr>
          <td>Mês de Referência:</td>
          <td>
            ${
              formData.text_mes
                ? `<span class="formatted-field">${formData.text_mes}</span>`
                : "N/I"
            }
          </td>
        </tr>
        <tr>
          <td>Dias de Uso:</td>
          <td>${formData.text_dias || "N/I"}</td>
        </tr>
        <tr>
          <td>Cidade:</td>
          <td>${formData.text_cidade || "N/I"}</td>
        </tr>
      </table>
    </div>

    <div class="message">
      <h3 style="color: #0369a1; margin-top: 0;">📝 Informações do Envio:</h3>
      <p style="white-space: pre-wrap; margin: 0;">
Comprovante de auxílio transporte referente ao mês de ${
      formData.text_mes || "N/I"
    }.

Documento assinado digitalmente e gerado automaticamente pelo Sistema TAPP.

Será enviado apenas o documento principal como anexo.

Atenciosamente,
${formData.text_nome || "Estudante"}
      </p>
    </div>

    <div class="attachments">
      <h3 style="color: #065f46; margin-top: 0;">📎 Documento Anexado:</h3>
      
      <div class="attachment-item">
        <strong>📄 Comprovante de Auxílio Transporte</strong><br>
        <small>Documento principal assinado digitalmente</small>
      </div>
      
      <p style="color: #065f46; margin: 10px 0 0 0; font-size: 14px;">
        <strong>Total de documentos:</strong> 1<br>
        <strong>Enviado por:</strong> ${formData.text_email || "Sistema TAPP"}
      </p>
    </div>
  </div>
  
  <div class="footer">
    <p>Email enviado automaticamente pelo <strong>Sistema TAPP</strong></p>
    <p>${new Date().getFullYear()} - Prefeitura Municipal</p>
  </div>
</body>
</html>
  `;
  },
};

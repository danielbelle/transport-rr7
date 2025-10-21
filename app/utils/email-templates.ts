export const emailTemplates = {
  formEmail: (subject: string, formData: any, message: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">${subject}</h2>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Dados do Formulário:</h3>
        <p style="margin: 5px 0;"><strong>Nome:</strong> ${
          formData.text_nome || "Não informado"
        }</p>
        <p style="margin: 5px 0;"><strong>RG:</strong> ${
          formData.text_rg || "Não informado"
        }</p>
        <p style="margin: 5px 0;"><strong>CPF:</strong> ${
          formData.text_cpf || "Não informado"
        }</p>
      </div>
      <div style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 5px;">
        ${message}
      </div>
      <div style="margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 5px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Email enviado via T-App | Formulário em anexo
        </p>
      </div>
    </div>
  `,
};

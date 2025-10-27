import { z } from "zod";
import { isValidationEnabled } from "~/lib/utils";
import { Logger } from "./utils/logger";

export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  if (!isValidationEnabled) {
    Logger.log("🔧 Validação Zod desabilitada via .env");
    return { success: true, data: data as T };
  }

  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.issues.map((issue) => issue.message);
    Logger.error("Erro de validação:", errors);
    return { success: false, errors };
  }
}

// Schemas
export const formDataSchema = z.object({
  text_nome: z.string().min(1, "Nome completo é obrigatório"),
  text_rg: z.string().min(1, "RG é obrigatório"),
  text_cpf: z.string().min(11, "CPF deve ter pelo menos 11 caracteres"),
  text_universidade: z.string().min(1, "Universidade é obrigatória"),
  text_semestre: z.string().min(1, "Semestre é obrigatório"),
  text_curso: z.string().min(1, "Curso é obrigatório"),
  text_mes: z.string().min(1, "Mês é obrigatório"),
  text_dias: z.string().min(1, "Dias são obrigatórios"),
  text_cidade: z.string().min(1, "Cidade é obrigatória"),
  text_email: z.string().email("Email inválido"),
  text_repete: z.string().optional(),
  signature: z.string().min(1, "Assinatura é obrigatória"),
});

export const emailSchema = z.object({
  to: z.string().email("Destinatário inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  html: z.string().min(1, "Conteúdo HTML é obrigatório"),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string(),
        encoding: z.string(),
      })
    )
    .optional(),
});

export const pdfFileSchema = z.object({
  name: z.string().endsWith(".pdf", "Arquivo deve ser PDF"),
  size: z.number().max(50 * 1024 * 1024, "Arquivo muito grande (máximo 50MB)"),
  type: z.literal("application/pdf"),
});

// Funções de validação
export const validateFormData = (data: unknown) =>
  validateWithZod(formDataSchema, data);

export const validateEmailData = (data: unknown) =>
  validateWithZod(emailSchema, data);

export const validatePdfFile = (data: unknown) =>
  validateWithZod(pdfFileSchema, data);

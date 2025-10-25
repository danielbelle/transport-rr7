import { z } from "zod";

// Schema de validação para environment variables
const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY é obrigatória"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VALIDATION_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),
});

// Tipo inferido do schema
export type Env = z.infer<typeof envSchema>;

// Função para validar e exportar env vars (segura para cliente)
export function getEnv(): Env {
  // No cliente, retorna valores padrão ou vazios
  if (typeof window !== "undefined") {
    return {
      RESEND_API_KEY: "",
      NODE_ENV: "development",
      VERCEL_ENV: undefined,
      VALIDATION_ENABLED: true, // No cliente, validação sempre ativa por segurança
    };
  }

  // No servidor, usa process.env
  try {
    const envVars = {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VALIDATION_ENABLED: process.env.VALIDATION_ENABLED,
    };

    return envSchema.parse(envVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return `${path}: ${issue.message}`;
        })
        .join("; ");

      throw new Error(`Configuração de ambiente inválida: ${errorDetails}`);
    }
    throw error;
  }
}

// Exportar env validado
export const env = getEnv();

// Helper para verificar ambiente
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isValidationEnabled = env.VALIDATION_ENABLED;

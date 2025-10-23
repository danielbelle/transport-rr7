import { z } from "zod";

// Schema de validação para environment variables
const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY é obrigatória"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
});

// Tipo inferido do schema
export type Env = z.infer<typeof envSchema>;

// Função para validar e exportar env vars
export function getEnv(): Env {
  try {
    const envVars = {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
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

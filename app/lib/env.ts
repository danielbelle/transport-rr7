import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY é obrigatória"),
  EMAIL_PREFERITO: z.email("EMAIL_PREFERITO deve ser um email válido"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VALIDATION_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default(true),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  if (typeof window !== "undefined") {
    // ✅ CLIENTE: Mantém como estava, mas adiciona o email da prefeitura
    return {
      RESEND_API_KEY: "",
      EMAIL_PREFERITO: import.meta.env.VITE_EMAIL_PREFERITO, // ✅ Email da prefeitura no cliente
      NODE_ENV: import.meta.env.MODE as Env["NODE_ENV"],
      VALIDATION_ENABLED: import.meta.env.VITE_VALIDATION_ENABLED === "true",
    };
  }

  // ✅ SERVIDOR: Mantém como estava, mas adiciona o email da prefeitura
  try {
    const envVars = {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_PREFERITO: process.env.EMAIL_PREFERITO, // ✅ Email da prefeitura no servidor
      NODE_ENV: process.env.NODE_ENV,
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

export const env = getEnv();
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isValidationEnabled = env.VALIDATION_ENABLED;
export const emailPrefeitura = env.EMAIL_PREFERITO;

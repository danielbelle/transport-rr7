import { z } from "zod";

const envSchema = z.object({
  SMTP_HOST: z.string().min(1, "SMTP_HOST é obrigatório"),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().min(1, "SMTP_USER é obrigatório"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS é obrigatório"),
  SMTP_FROM: z.string().min(1, "SMTP_FROM é obrigatório"),

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
    // ✅ CLIENTE: Mantém apenas o email da prefeitura
    return {
      SMTP_HOST: "",
      SMTP_PORT: 587,
      SMTP_USER: "",
      SMTP_PASS: "",
      SMTP_FROM: "",
      EMAIL_PREFERITO: import.meta.env.VITE_EMAIL_PREFERITO,
      NODE_ENV: import.meta.env.MODE as Env["NODE_ENV"],
      VALIDATION_ENABLED: import.meta.env.VITE_VALIDATION_ENABLED === "true",
    };
  }

  // ✅ SERVIDOR: Carrega todas as variáveis SMTP
  try {
    const envVars = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
      EMAIL_PREFERITO: process.env.EMAIL_PREFERITO,
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

// 🔄 NOVOS: Exportações SMTP
export const smtpConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.SMTP_FROM,
};

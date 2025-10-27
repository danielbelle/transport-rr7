import type { FieldConfig, FieldType } from "~/lib/types";

export interface FieldConfigOptions {
  key: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
  font?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontPdf?: number;
  xPdf?: number;
  yPdf?: number;
  required?: boolean;
  hidden?: boolean;
  transformValue?: (value: string) => string;
}

export const createFieldConfig = (options: FieldConfigOptions): FieldConfig => {
  const {
    key,
    name,
    label,
    placeholder = "",
    type = "text",
    font = 12,
    x = 0,
    y = 0,
    width,
    height,
    fontPdf,
    xPdf,
    yPdf,
    required = false,
    hidden = false,
    transformValue,
  } = options;

  return {
    key,
    name,
    label,
    placeholder,
    type,
    font,
    x,
    y,
    width,
    height,
    fontPdf: fontPdf ?? font,
    xPdf: xPdf ?? x,
    yPdf: yPdf ?? y,
    required,
    hidden,
    transformValue,
  };
};

export const ValueTransformers = {
  /**
   * Transforma números de 1-12 em nomes de meses apenas quando o campo perde o foco
   * ou quando o valor está completo
   */
  monthNumberToName: (value: string): string => {
    if (!value || value.trim() === "") return value;

    const monthMap: Record<string, string> = {
      "1": "janeiro",
      "2": "fevereiro",
      "3": "março",
      "4": "abril",
      "5": "maio",
      "6": "junho",
      "7": "julho",
      "8": "agosto",
      "9": "setembro",
      "10": "outubro",
      "11": "novembro",
      "12": "dezembro",
    };

    const trimmedValue = value.trim();

    // Se já é um nome de mês, retorna como está
    const monthNames = Object.values(monthMap);
    if (monthNames.includes(trimmedValue.toLowerCase())) {
      return trimmedValue;
    }

    // Aplica transformação apenas se o valor for exatamente um número de 1-12
    const numValue = parseInt(trimmedValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
      return monthMap[trimmedValue] || trimmedValue;
    }

    return trimmedValue;
  },

  /**
   * Adiciona ° ao número do semestre apenas quando o campo perde o foco
   * ou quando o valor está completo
   */
  addSemesterDegree: (value: string): string => {
    if (!value || value.trim() === "") return value;

    const trimmedValue = value.trim();

    // Se já tem °, retorna como está
    if (trimmedValue.includes("°")) {
      return trimmedValue;
    }

    // Aplica transformação apenas se o valor for exatamente um número
    if (/^\d+$/.test(trimmedValue)) {
      return `${trimmedValue}°`;
    }

    return trimmedValue;
  },
};

export const FieldFactories = {
  text: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "text" }),

  email: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "email" }),

  number: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "number" }),

  signature: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "signature" }),

  month: (options: Omit<FieldConfigOptions, "type" | "transformValue">) =>
    createFieldConfig({
      ...options,
      type: "text",
      transformValue: ValueTransformers.monthNumberToName,
    }),

  semester: (options: Omit<FieldConfigOptions, "type" | "transformValue">) =>
    createFieldConfig({
      ...options,
      type: "text",
      transformValue: ValueTransformers.addSemesterDegree,
    }),

  hidden: (
    options: Omit<
      FieldConfigOptions,
      "type" | "font" | "x" | "y" | "fontPdf" | "xPdf" | "yPdf"
    >
  ) =>
    createFieldConfig({
      ...options,
      type: "text",
      font: 0,
      x: 0,
      y: 0,
      fontPdf: 0,
      xPdf: 0,
      yPdf: 0,
      hidden: true,
    }),
};

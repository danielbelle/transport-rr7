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
  };
};

// Factory para tipos específicos de campos
export const FieldFactories = {
  text: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "text" }),

  email: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "email" }),

  number: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "number" }),

  signature: (options: Omit<FieldConfigOptions, "type">) =>
    createFieldConfig({ ...options, type: "signature" }),

  // Campo oculto (apenas dados)
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

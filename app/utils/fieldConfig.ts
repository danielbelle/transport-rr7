import type { FieldConfig } from "~/utils/types";

export const fieldConfig: FieldConfig[] = [
  {
    key: "text_nome",
    name: "text_nome",
    label: "Nome Completo",
    placeholder: "Digite seu nome completo",
    type: "text",
    font: 14,
    x: 120,
    y: 131,
    required: true,
  },
  {
    key: "text_rg",
    name: "text_rg",
    label: "RG",
    placeholder: "Digite seu RG",
    type: "text",
    font: 14,
    x: 261,
    y: 168,
    required: true,
  },
  {
    key: "text_cpf",
    name: "text_cpf",
    label: "CPF",
    placeholder: "Digite seu CPF",
    type: "text",
    font: 16,
    x: 100,
    y: 206,
    required: true,
  },
  {
    key: "signature",
    name: "signature",
    label: "Assinatura",
    placeholder: "Clique para assinar",
    type: "signature",
    font: 0,
    x: 100, // Posição X no PDF
    y: 300, // Posição Y no PDF (ajuste conforme necessário)
    width: 500, // Largura da assinatura no PDF
    height: 100, // Altura da assinatura no PDF
    required: true,
  },
];

// Configuração para PDF
export const pdfFieldConfig: Record<string, { x: number; y: number }> = {
  text_nome: { x: 0, y: 131 },
  text_rg: { x: 261, y: 168 },
  text_cpf: { x: 100, y: 206 },
  signature: { x: 100, y: 300 },
};

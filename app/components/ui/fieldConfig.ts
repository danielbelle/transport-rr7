import type { FieldConfig } from "~/components/types";

export const fieldConfig: FieldConfig[] = [
  {
    key: "text_nome",
    label: "Nome Completo",
    placeholder: "Digite seu nome completo",
    type: "text",
    font: 14,
    x: 123,
    y: 131,
    required: true,
  },
  {
    key: "text_rg",
    label: "RG",
    placeholder: "Digite seu RG",
    type: "number",
    font: 14,
    x: 261,
    y: 168,
    required: true,
  },
  {
    key: "text_cpf",
    label: "CPF",
    placeholder: "Digite seu CPF",
    type: "number",
    font: 16,
    x: 100,
    y: 206,
    required: true,
  },
  {
    key: "signature",
    label: "Assinatura",
    placeholder: "Clique para assinar",
    type: "signature",
    font: 0,
    x: 250,
    y: 500,
    width: 600,
    height: 150,
    required: true,
  },
];

const pdfFieldConfig: {
  [key: string]: { x: number; y: number; page: number; field: string };
} = {
  nome: {
    x: 120, // Posição para "Eu, _____"
    y: 720, // Primeiro campo em branco
    page: 0,
    field: "nome",
  },
  rg: {
    x: 280, // Posição para "RG nº _____"
    y: 700, // Linha abaixo do nome
    page: 0,
    field: "rg",
  },
  cpf: {
    x: 280, // Posição para "CPF sob nº _____"
    y: 680, // Linha abaixo do RG
    page: 0,
    field: "cpf",
  },
  instituicao: {
    x: 120, // Posição para "estudante regularmente matriculado na _____"
    y: 640, // Linha da instituição
    page: 0,
    field: "instituicao",
  },
  semestre: {
    x: 120, // Posição para "cursando o ____- semestre"
    y: 610, // Linha do semestre
    page: 0,
    field: "semestre",
  },
  curso: {
    x: 250, // Posição para "do curso de _____"
    y: 610, // Mesma linha do semestre
    page: 0,
    field: "curso",
  },
  mes: {
    x: 350, // Posição para "mês de _____"
    y: 550, // Linha do mês
    page: 0,
    field: "mes",
  },
  ano: {
    x: 450, // Posição para "ano de 2025"
    y: 550, // Mesma linha do mês
    page: 0,
    field: "ano",
  },
  dias: {
    x: 300, // Posição para "me desloquei _____ dias"
    y: 530, // Linha dos dias
    page: 0,
    field: "dias",
  },
  municipio: {
    x: 350, // Posição para "município de _____"
    y: 510, // Linha do município
    page: 0,
    field: "municipio",
  },
  assinatura: {
    x: 350, // Posição para "_____" da assinatura
    y: 400, // Linha da assinatura
    page: 0,
    field: "assinatura",
  },
  nome_assinatura: {
    x: 350, // Posição para "Nome:" abaixo da assinatura
    y: 380, // Linha do nome
    page: 0,
    field: "nome_assinatura",
  },
};

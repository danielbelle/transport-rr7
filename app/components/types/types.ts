export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fieldKey: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "email" | "tel" | "date" | "signature";
  font: number;
  x: number;
  y: number;
  required: boolean;
  hidden?: boolean;
}

export interface FormData {
  [key: string]: string;
}

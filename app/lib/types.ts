export interface BaseFieldConfig {
  key: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  hidden?: boolean;
}

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "date"
  | "signature";

export interface FieldConfig extends BaseFieldConfig {
  type: FieldType;
  font: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontPdf: number;
  xPdf: number;
  yPdf: number;
}

export interface TappFormData {
  text_nome: string;
  text_rg: string;
  text_cpf: string;
  text_universidade: string;
  text_semestre: string;
  text_curso: string;
  text_mes: string;
  text_dias: string;
  text_cidade: string;
  text_email: string;
  text_repete: string;
  signature: string;
}

export interface FormInputProps {
  field: FieldConfig;
  value: string;
  onChange: (fieldKey: string, value: string) => void;
}

export interface FormSignatureProps {
  field: FieldConfig;
  onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
  initialSignature?: string;
}

export interface CanvasPreviewProps {
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  textOverlays: TextOverlay[];
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fieldKey: string;
  type: "text" | "signature";
  imageData?: string;
  width?: number;
  height?: number;
}

export interface LiveImageProps {
  formData: TappFormData;
}

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  required?: boolean;
}

export interface EmailSenderProps {
  formData: TappFormData;
  onEmailSent?: () => void;
}

export interface CompressionInfo {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  success: boolean;
  message: string;
}

export interface PdfCompressResult {
  compressedBytes: Uint8Array;
  info: CompressionInfo;
}

export interface PdfMergeResult {
  mergedBytes: Uint8Array;
  pageCount: number;
  totalSize: number;
}

export type FormStep = "form" | "email" | "preview";

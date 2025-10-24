// Manter TODOS os tipos que estão sendo usados atualmente

export interface FormData {
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

export interface FlexibleFormData extends FormData {
  [key: string]: string | undefined;
}

export interface FieldConfig {
  key: string;
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "email" | "tel" | "date" | "signature";
  font: number;
  x: number;
  y: number;
  fontPdf: number;
  xPdf: number;
  yPdf: number;
  required: boolean;
  hidden?: boolean;
  width?: number;
  height?: number;
}

// COMPONENT PROPS
export interface FormProps {
  onFormDataChange?: (data: FormData) => void;
  initialData?: FormData;
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
  formData: FormData;
}

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  required?: boolean;
}

export interface EmailSenderProps {
  formData: FormData;
  onEmailSent?: () => void;
}

// PDF UTILS TYPES - ESSENCIAIS para os utilitários de PDF
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

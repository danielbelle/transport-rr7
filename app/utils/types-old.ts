/**
 * Componente que escreve no canvas
 */

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
}

/**
 * Componente que define os inputs
 */
export interface FieldConfig {
  key: string;
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "email" | "tel" | "date" | "signature";
  font: number;
  x: number;
  y: number;
  required: boolean;
  hidden?: boolean;
  width?: number;
  height?: number;
}

/**
 * Componente de formulário
 */
export interface FormData {
  text_nome: string;
  text_rg: string;
  text_cpf: string;
  signature?: string; // Adicionado campo opcional para assinatura
}

// Tipo mais flexível para uso interno no ImageLive
export type FlexibleFormData = FormData & Record<string, string | undefined>;

/**
 * Componente de assinatura
 */
export interface SignatureComponentProps {
  onSignatureChange?: (signatureData: string | null) => void;
}

export interface SignatureFieldProps {
  field: FieldConfig;
  onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
}

export interface FieldInputProps {
  field: FieldConfig;
  formData: FlexibleFormData;
  onChange: (fieldKey: string, value: string) => void;
  onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
}

export interface CanvasPreviewProps {
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  textOverlays: TextOverlay[];
}

export interface FormProps {
  onFormDataChange?: (data: FormData) => void;
  initialData?: FormData;
}
export interface PdfLiveProps {
  formData: FormData;
  onPdfGenerated?: (pdfUrl: string) => void;
}
export interface ImageLiveProps {
  formData: FormData;
  onImageGenerated?: (imageUrl: string) => void;
}

export interface PdfLiveRef {
  getCurrentPdfBytes: () => Uint8Array | null;
  generatePdf: () => Promise<Uint8Array | null>;
}

export interface EmailWithPdfProps {
  formPdfBytes: Uint8Array | null;
  formData: FormData;
}

export interface PdfMergeWithFormRef {
  performMerge: () => Promise<Uint8Array | null>;
  getMergedPdfBytes: () => Uint8Array | null;
  hasUploadedFile: () => boolean;
  setOnFileChange?: (callback: (hasFile: boolean) => void) => void;
}

export interface PdfMergeWithFormProps {
  formPdfBytes: Uint8Array | null;
  onMergeComplete?: (mergedPdfBytes: Uint8Array) => void;
  onFileSelectionChange?: (hasFile: boolean) => void;
}

export interface EmailSenderProps {
  pdfBytes: Uint8Array | null;
  formData: FormData;
  onEmailSent?: (pdfBytes: Uint8Array) => void;
  pdfMergeRef?: React.RefObject<PdfMergeWithFormRef | null>;
  pdfLiveRef?: React.RefObject<PdfLiveRef | null>;
}

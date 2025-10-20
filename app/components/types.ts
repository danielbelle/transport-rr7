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
}

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
  formData: FormData;
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

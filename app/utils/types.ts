// =============================================================================
// TIPOS DE DADOS COMPARTILHADOS
// =============================================================================

/**
 * Dados do formulário principal
 */
export interface FormData {
  text_nome: string;
  text_rg: string;
  text_cpf: string;
  signature?: string;
}

/**
 * FormData flexível para uso interno
 */
export interface FlexibleFormData extends FormData {
  [key: string]: string | undefined;
}

/**
 * Configuração de campos do formulário
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
  fontPdf: number;
  xPdf: number;
  yPdf: number;
  required: boolean;
  hidden?: boolean;
  width?: number;
  height?: number;
}

// =============================================================================
// COMPONENTE: FORM
// =============================================================================

export interface FormProps {
  onFormDataChange?: (data: FormData) => void;
  initialData?: FormData;
}

export interface FieldInputProps {
  field: FieldConfig;
  formData: FlexibleFormData;
  onChange: (fieldKey: string, value: string) => void;
  onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
}

// =============================================================================
// COMPONENTE: ASSINATURA
// =============================================================================

export interface SignatureComponentProps {
  onSignatureChange?: (signatureData: string | null) => void;
}

export interface SignatureFieldProps {
  field: FieldConfig;
  onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
}

export interface FormSignatureProps {
  field: FieldConfig;
  onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
}

// =============================================================================
// COMPONENTE: CANVAS PREVIEW
// =============================================================================

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

export interface CanvasPreviewProps {
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  textOverlays: TextOverlay[];
}

// =============================================================================
// COMPONENTE: LIVE IMAGE
// =============================================================================

export interface LiveImageProps {
  formData: FormData;
  onImageGenerated?: (imageUrl: string) => void;
}

// =============================================================================
// COMPONENTE: LIVE PDF
// =============================================================================

export interface LivePdfProps {
  formData: FormData;
  onPdfGenerated?: (pdfUrl: string) => void;
}

export interface PdfLiveRef {
  getCurrentPdfBytes: () => Uint8Array | null;
  generatePdf: () => Promise<Uint8Array | null>;
}

// =============================================================================
// COMPONENTE: PDF MERGE WITH FORM
// =============================================================================

export interface PdfMergeWithFormProps {
  formPdfBytes: Uint8Array | null;
  onMergeComplete?: (mergedPdfBytes: Uint8Array) => void;
  onFileSelectionChange?: (hasFile: boolean) => void;
}

export interface PdfMergeWithFormRef {
  performMerge: () => Promise<Uint8Array | null>;
  getMergedPdfBytes: () => Uint8Array | null;
  hasUploadedFile: () => boolean;
  setOnFileChange?: (callback: (hasFile: boolean) => void) => void;
}

// =============================================================================
// COMPONENTE: EMAIL SENDER
// =============================================================================

export interface EmailSenderProps {
  pdfBytes: Uint8Array | null;
  formData: FormData;
  onEmailSent?: (pdfBytes: Uint8Array) => void;
  pdfMergeRef?: React.RefObject<FileAttachRef | null>;
  pdfLiveRef?: React.RefObject<PdfLiveRef | null>;
}

export interface EmailWithPdfProps {
  formPdfBytes: Uint8Array | null;
  formData: FormData;
}

// =============================================================================
// UTILITÁRIO: PDF COMPRESS
// =============================================================================

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

export interface PdfCompressRef {
  compressPdf: (pdfBytes: Uint8Array) => Promise<Uint8Array>;
  getCompressionInfo: () => CompressionInfo | null;
  needsCompression: (
    pdfBytes: Uint8Array,
    emailHtml: string,
    otherAttachments?: any[]
  ) => boolean;
}

export interface PdfCompressProps {
  onCompressionComplete?: (info: CompressionInfo) => void;
}

// =============================================================================
// UTILITÁRIO: PDF FORM EDIT
// =============================================================================

export interface PdfFormEditUtils {
  generateFormPdf: (formData: FormData) => Promise<Uint8Array>;
}

export interface PdfMergeResult {
  mergedBytes: Uint8Array;
  pageCount: number;
  totalSize: number;
}

// =============================================================================
// COMPONENTE: File Attach
// =============================================================================

export interface FileAttachProps {
  formPdfBytes: Uint8Array | null;
  onMergeComplete?: (mergedPdfBytes: Uint8Array) => void;
  onFileSelectionChange?: (hasFile: boolean) => void;
}

export interface FileAttachRef {
  performMerge: () => Promise<Uint8Array | null>;
  getMergedPdfBytes: () => Uint8Array | null;
  hasUploadedFile: () => boolean;
  setOnFileChange?: (callback: (hasFile: boolean) => void) => void;
}

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  required?: boolean;
}

export interface FormInputProps {
  field: FieldConfig;
  value: string;
  onChange: (fieldKey: string, value: string) => void;
}

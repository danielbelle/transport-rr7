export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface BaseFieldConfig {
  key: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  hidden?: boolean;
  transformValue?: (value: string) => string;
}

export namespace AppTypes {
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

  export type FormStep = "form" | "email" | "preview";
}

export namespace ComponentTypes {
  export interface ButtonProps extends BaseComponentProps {
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
  }

  export interface CardProps extends BaseComponentProps {}

  export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl";
  }

  export interface FormInputProps {
    field?: AppTypes.FieldConfig;
    type?: "text" | "number" | "email" | "tel" | "date" | "password";
    value: string;
    onChange: (fieldKey: string, value: string) => void;
    placeholder?: string;
    label?: string;
    name?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
  }

  export interface FormSignatureProps {
    field: AppTypes.FieldConfig;
    onSignatureChange: (fieldKey: string, signatureData: string | null) => void;
    initialSignature?: string;
  }

  export interface CanvasPreviewProps {
    imageUrl: string;
    canvasWidth: number;
    canvasHeight: number;
    textOverlays: DataTypes.TextOverlay[];
  }

  export interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    accept?: string;
    label?: string;
    required?: boolean;
  }

  export interface EmailSenderProps {
    formData: AppTypes.TappFormData;
    onEmailSent?: () => void;
  }
}

export namespace DataTypes {
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
    formData: AppTypes.TappFormData;
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
}

export type FieldConfig = AppTypes.FieldConfig;
export type TappFormData = AppTypes.TappFormData;
export type FieldType = AppTypes.FieldType;
export type FormStep = AppTypes.FormStep;
export type ButtonProps = ComponentTypes.ButtonProps;
export type CardProps = ComponentTypes.CardProps;
export type ModalProps = ComponentTypes.ModalProps;
export type FormInputProps = ComponentTypes.FormInputProps;
export type FormSignatureProps = ComponentTypes.FormSignatureProps;
export type CanvasPreviewProps = ComponentTypes.CanvasPreviewProps;
export type FileUploadProps = ComponentTypes.FileUploadProps;
export type EmailSenderProps = ComponentTypes.EmailSenderProps;
export type TextOverlay = DataTypes.TextOverlay;
export type LiveImageProps = DataTypes.LiveImageProps;
export type CompressionInfo = DataTypes.CompressionInfo;
export type PdfCompressResult = DataTypes.PdfCompressResult;
export type PdfMergeResult = DataTypes.PdfMergeResult;

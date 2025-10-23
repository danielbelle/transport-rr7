import { create } from "zustand";
import type { FormData } from "~/utils/types";

type DocumentStep = "form" | "preview" | "email";

interface DocumentStore {
  // Estados globais realmente necessários
  currentStep: DocumentStep;
  pdfBytes: Uint8Array | null;
  uploadedFile: File | null;
  isGeneratingPdf: boolean;
  isSendingEmail: boolean;

  // Ações
  setCurrentStep: (step: DocumentStep) => void;
  setPdfBytes: (bytes: Uint8Array | null) => void;
  setUploadedFile: (file: File | null) => void;
  setIsGeneratingPdf: (generating: boolean) => void;
  setIsSendingEmail: (sending: boolean) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  // Estado inicial
  currentStep: "form",
  pdfBytes: null,
  uploadedFile: null,
  isGeneratingPdf: false,
  isSendingEmail: false,

  // Ações
  setCurrentStep: (step) => set({ currentStep: step }),
  setPdfBytes: (bytes) => set({ pdfBytes: bytes }),
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setIsGeneratingPdf: (generating) => set({ isGeneratingPdf: generating }),
  setIsSendingEmail: (sending) => set({ isSendingEmail: sending }),
  reset: () =>
    set({
      currentStep: "form",
      pdfBytes: null,
      uploadedFile: null,
      isGeneratingPdf: false,
      isSendingEmail: false,
    }),
}));

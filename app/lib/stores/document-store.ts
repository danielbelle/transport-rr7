import { create } from "zustand";
import { persist } from "zustand/middleware";

type DocumentStep = "form" | "email";

interface DocumentStore {
  // Estados realmente usados
  currentStep: DocumentStep;
  uploadedFile: File | null;
  isSendingEmail: boolean;
  pdfBytes: Uint8Array | null;

  // Ações simplificadas
  setCurrentStep: (step: DocumentStep) => void;
  setUploadedFile: (file: File | null) => void;
  setIsSendingEmail: (sending: boolean) => void;
  setPdfBytes: (bytes: Uint8Array | null) => void;

  // Reset apenas para estados temporários
  resetTemporaryState: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      // Estado inicial
      currentStep: "form",
      uploadedFile: null,
      isSendingEmail: false,
      pdfBytes: null,

      // Ações
      setCurrentStep: (step) => set({ currentStep: step }),
      setUploadedFile: (file) => set({ uploadedFile: file }),
      setIsSendingEmail: (sending) => set({ isSendingEmail: sending }),
      setPdfBytes: (bytes) => set({ pdfBytes: bytes }),

      resetTemporaryState: () =>
        set({
          uploadedFile: null,
          isSendingEmail: false,
          pdfBytes: null,
        }),
    }),
    {
      name: "document-storage",
      partialize: (state) => ({
        // Persistir apenas currentStep, não estados temporários
        currentStep: state.currentStep,
      }),
    }
  )
);

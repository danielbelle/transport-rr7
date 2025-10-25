import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocumentStore {
  currentStep: "form" | "email";
  uploadedFile: File | null;
  isSendingEmail: boolean;
  pdfBytes: Uint8Array | null;

  setCurrentStep: (step: "form" | "email") => void;
  setUploadedFile: (file: File | null) => void;
  setIsSendingEmail: (sending: boolean) => void;
  setPdfBytes: (bytes: Uint8Array | null) => void;
  resetTemporaryState: () => void;
  resetToForm: () => void; //
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      currentStep: "form", //
      uploadedFile: null,
      isSendingEmail: false,
      pdfBytes: null,

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
      resetToForm: () => set({ currentStep: "form" }), // ✅ Nova função
    }),
    {
      name: "document-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
      }),
    }
  )
);

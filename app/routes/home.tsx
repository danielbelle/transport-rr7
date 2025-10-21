import { useState, useRef } from "react";
import type { Route } from "./+types/main";
import Form from "~/components/Form";
import PdfLive from "~/components/PdfLive";
import ImageLive from "~/components/ImageLive";
import PdfMergeWithForm from "~/components/PdfMergeWithForm";
import EmailSender from "~/components/EmailSender";
import type {
  FormData,
  PdfLiveRef,
  PdfMergeWithFormRef,
} from "~/components/types";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    text_nome: "",
    text_rg: "",
    text_cpf: "",
  });

  const pdfLiveRef = useRef<PdfLiveRef>(null);
  const pdfMergeRef = useRef<PdfMergeWithFormRef | null>(null);

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  const getCurrentPdfBytes = (): Uint8Array | null => {
    return pdfLiveRef.current?.getCurrentPdfBytes() || null;
  };

  const handleEmailSent = (pdfBytes: Uint8Array) => {
    console.log("Email enviado com sucesso!", pdfBytes);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Editor Multiplataforma
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Preencha o formulário e veja PDF e Imagem atualizarem em tempo real
          </p>
        </div>

        {/* Formulário */}
        <div className="mb-6">
          <Form onFormDataChange={handleFormDataChange} />
        </div>

        {/* Visualizações em Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PdfLive ref={pdfLiveRef} formData={formData} />
          <ImageLive formData={formData} />
        </div>

        {/* Ferramentas de PDF - Fluxo Separado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PdfMergeWithForm
            ref={pdfMergeRef}
            formPdfBytes={getCurrentPdfBytes()}
          />

          <EmailSender
            pdfBytes={getCurrentPdfBytes()}
            formData={formData}
            onEmailSent={handleEmailSent}
            pdfMergeRef={pdfMergeRef}
            pdfLiveRef={pdfLiveRef} // NOVA PROP PASSADA AQUI
          />
        </div>
      </div>
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Editor Multiplataforma - T-App" },
    {
      name: "description",
      content:
        "Preencha formulários e veja PDF e Imagem atualizarem em tempo real",
    },
  ];
}

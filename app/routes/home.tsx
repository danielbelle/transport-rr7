import { useState } from "react";
import type { Route } from "./+types/main";
import Form from "~/components/Form";
import PdfLive from "~/components/PdfLive";
import ImageLive from "~/components/ImageLive";
import type { FormData } from "~/components/types";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    text_nome: "",
    text_rg: "",
    text_cpf: "",
  });

  const handleFormDataChange = (data: FormData) => {
    console.log("Dados do formulário atualizados:", data);
    setFormData(data);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visualização do PDF */}
          <PdfLive formData={formData} />

          {/* Visualização da Imagem */}
          <ImageLive formData={formData} />
        </div>
      </div>
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Editor de PDF - T-App" },
    {
      name: "description",
      content: "Preencha formulários e veja o PDF atualizar em tempo real",
    },
  ];
}

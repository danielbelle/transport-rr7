import { useState, useEffect } from "react";
import type { Route } from "./+types/route";
import HomeForm from "./components/HomeForm";
import HomeEmailSender from "./components/HomeEmailSender";
import HomeLiveImage from "./components/HomeLiveImage";
import type { FormData } from "~/lib/types";
import { useDocumentStore } from "~/lib/stores";

// Estado inicial fixo para evitar hydration mismatch
const initialFormData: FormData = {
  text_nome: "",
  text_rg: "",
  text_cpf: "",
  text_universidade: "",
  text_semestre: "",
  text_curso: "",
  text_mes: "",
  text_dias: "",
  text_cidade: "",
  text_email: "",
  signature: "",
  text_repete: "",
};

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { currentStep, setCurrentStep } = useDocumentStore();

  // ✅ CORREÇÃO: Recuperar assinatura do sessionStorage ao montar
  useEffect(() => {
    const tempSignature = sessionStorage.getItem("temp_signature");
    if (tempSignature) {
      console.log(
        "🔄 Recuperando assinatura do sessionStorage no componente pai"
      );
      setFormData((prev) => ({
        ...prev,
        signature: tempSignature,
      }));
      sessionStorage.removeItem("temp_signature"); // Limpar após usar
    }
  }, []);

  // ✅ GARANTIR que sempre inicie no formulário
  useEffect(() => {
    setCurrentStep("form");
  }, [setCurrentStep]);

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  const handleEmailSent = () => {
    setFormData(initialFormData);
    sessionStorage.removeItem("temp_signature"); // Limpar ao enviar email
  };

  // ✅ CORREÇÃO: Função para atualizar apenas a assinatura
  const handleSignatureUpdate = (signatureData: string | null) => {
    setFormData((prev) => ({
      ...prev,
      signature: signatureData || "",
    }));

    // ✅ Também salvar no sessionStorage como backup
    if (signatureData) {
      sessionStorage.setItem("temp_signature", signatureData);
    } else {
      sessionStorage.removeItem("temp_signature");
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {currentStep === "email" ? (
            <HomeEmailSender
              formData={formData}
              onEmailSent={handleEmailSent}
              onSignatureUpdate={handleSignatureUpdate} // ✅ Nova prop
            />
          ) : (
            <HomeForm
              onFormDataChange={handleFormDataChange}
              initialData={formData}
            />
          )}

          <HomeLiveImage formData={formData} />
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

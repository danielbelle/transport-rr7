import { useState, useEffect } from "react";
import type { Route } from "./+types/route";
import Form from "~/components/ui/Form";
import HomeEmailSender from "./components/HomeEmailSender";
import HomeLiveImage from "./components/HomeLiveImage";
import type { FormData } from "~/lib/types";
import { useDocumentStore } from "~/lib/stores";
import { useForm } from "~/hooks/useForm";
import { homeFieldConfig } from "./utils/home-field-config";

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

  useEffect(() => {
    const tempSignature = sessionStorage.getItem("temp_signature");
    if (tempSignature) {
      setFormData((prev) => ({
        ...prev,
        signature: tempSignature,
      }));
      sessionStorage.removeItem("temp_signature");
    }
  }, []);

  useEffect(() => {
    setCurrentStep("form");
  }, [setCurrentStep]);

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  const handleEmailSent = () => {
    setFormData(initialFormData);
    sessionStorage.removeItem("temp_signature");
  };

  const handleSignatureUpdate = (signatureData: string | null) => {
    setFormData((prev) => ({
      ...prev,
      signature: signatureData || "",
    }));

    if (signatureData) {
      sessionStorage.setItem("temp_signature", signatureData);
    } else {
      sessionStorage.removeItem("temp_signature");
    }
  };

  // Filtrar campos visíveis excluindo a assinatura
  const visibleFields = homeFieldConfig.filter(
    (field) => !field.hidden && field.type !== "signature"
  );

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
              onSignatureUpdate={handleSignatureUpdate}
            />
          ) : (
            <Form
              fields={visibleFields}
              formData={formData}
              onFormDataChange={handleFormDataChange}
            >
              <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setCurrentStep("email")}
                  disabled={
                    !formData.text_nome ||
                    !formData.text_rg ||
                    !formData.text_cpf
                  }
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    formData.text_nome && formData.text_rg && formData.text_cpf
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  {formData.text_nome && formData.text_rg && formData.text_cpf
                    ? "Continuar para Envio por Email"
                    : "Preencha todos os campos para continuar"}
                </button>
              </div>
            </Form>
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

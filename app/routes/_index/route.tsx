import { useState } from "react";
import type { Route } from "./+types/route";
import HomeForm from "./components/HomeForm";
import HomeEmailSender from "./components/HomeEmailSender";
import HomeLiveImage from "./components/HomeLiveImage";
import type { FormData } from "~/lib/types";
import { useDocumentStore } from "~/lib/stores";

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
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
  });

  const { currentStep, setCurrentStep } = useDocumentStore();
  const [isFormComplete, setIsFormComplete] = useState(false);

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);

    const requiredFields = [
      "text_nome",
      "text_rg",
      "text_cpf",
      "text_universidade",
      "text_semestre",
      "text_curso",
      "text_mes",
      "text_dias",
      "text_cidade",
      "text_email",
      "signature",
      "text_repete",
    ];

    const isComplete = requiredFields.every(
      (field) => data[field as keyof FormData]?.toString().trim() !== ""
    );

    setIsFormComplete(isComplete);
  };

  const handleEmailSent = () => {
    setFormData({
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
    });
    setIsFormComplete(false);
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
            <div className="space-y-4">
              <HomeEmailSender
                formData={formData}
                onEmailSent={handleEmailSent}
              />
              <button
                onClick={() => setCurrentStep("form")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
              >
                ← Voltar ao Formulário
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <HomeForm
                onFormDataChange={handleFormDataChange}
                initialData={formData}
              />
              {isFormComplete && (
                <button
                  onClick={() => setCurrentStep("email")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  📧 Continuar para Envio por Email
                </button>
              )}
            </div>
          )}

          <HomeLiveImage formData={formData} />
        </div>

        {currentStep === "form" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400">
              <div className="font-semibold mb-2">Status do Formulário:</div>
              <div
                className={`font-medium ${
                  isFormComplete ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {isFormComplete
                  ? "✅ Formulário completo! Clique no botão acima para enviar por email."
                  : "⏳ Preencha todos os campos para continuar."}
              </div>
            </div>
          </div>
        )}
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

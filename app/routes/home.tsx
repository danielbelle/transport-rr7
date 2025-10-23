import { useState } from "react";
import type { Route } from "./+types/home";
import EmailSender from "~/components/EmailSender";
import Form from "~/components/Form";
import LiveImage from "~/components/LiveImage";
import type { FormData } from "~/utils/types";
import { useDocumentStore } from "~/stores/document-store";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    text_nome: "",
    text_rg: "",
    text_cpf: "",
    signature: "",
  });

  const { currentStep, setCurrentStep } = useDocumentStore();

  const [isFormComplete, setIsFormComplete] = useState(false);

  const handleFormDataChange = (data: FormData) => {
    setFormData(data);

    const isComplete =
      data.text_nome?.trim() !== "" &&
      data.text_rg?.trim() !== "" &&
      data.text_cpf?.trim() !== "" &&
      data.signature?.trim() !== "";

    setIsFormComplete(isComplete);
  };

  const handleShowEmailSender = () => {
    setCurrentStep("email");
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
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

        {/* Formulário ou EmailSender baseado no step */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {currentStep === "email" ? (
            <div className="space-y-4">
              <EmailSender
                formData={formData}
                onEmailSent={() => setCurrentStep("form")}
              />
              <button
                onClick={handleBackToForm}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
              >
                ← Voltar ao Formulário
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Form onFormDataChange={handleFormDataChange} />
              {isFormComplete && (
                <button
                  onClick={handleShowEmailSender}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  📧 Continuar para Envio por Email
                </button>
              )}
            </div>
          )}

          <LiveImage formData={formData} />
        </div>

        {/* Status do Formulário */}
        {currentStep === "form" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Status do Formulário:
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <div>
                <strong>Nome:</strong>
                {formData.text_nome || "❌ Não preenchido"}
              </div>
              <div>
                <strong>RG:</strong> {formData.text_rg || "❌ Não preenchido"}
              </div>
              <div>
                <strong>CPF:</strong> {formData.text_cpf || "❌ Não preenchido"}
              </div>
              <div>
                <strong>Assinatura:</strong>
                {formData.signature ? "✅ Preenchida" : "❌ Pendente"}
              </div>
              <div
                className={`mt-2 font-medium ${
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

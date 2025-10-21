import { useState } from "react";
import type { Route } from "./+types/home";
import LiveForm from "~/components/LiveForm";
import SignatureComponent from "~/components/SignatureComponent";
import PdfMerger from "~/components/PdfMerger";
import EmailSender from "~/components/EmailSenderold";
import EmailEditor from "~/components/EmailEditor";
import { devLog } from "~/utils/dev-log";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "T-App - Dashboard de Componentes" },
    {
      name: "description",
      content:
        "Coleção de ferramentas úteis para assinatura digital, PDF e email",
    },
  ];
}

export default function Home() {
  const [activeSignature, setActiveSignature] = useState<string | null>(null);

  const handleFormSubmit = (data: any) => {
    devLog.log("Formulário enviado:", data);
  };

  const handleSignatureChange = (signatureData: string | null) => {
    setActiveSignature(signatureData);
    devLog.log(
      "Assinatura atualizada:",
      signatureData ? "Assinatura presente" : "Assinatura limpa"
    );
  };

  const handlePdfMerge = (mergedPdfBytes: Uint8Array) => {
    devLog.log("PDFs mesclados:", mergedPdfBytes);
  };

  const handleEmailSent = (result: any) => {
    devLog.log("Email enviado:", result);
  };

  const handleEmailUpdate = (emailData: any) => {
    devLog.log("Email atualizado:", emailData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            T-App Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Coleção de ferramentas úteis para assinatura digital, PDF e email
          </p>
        </div>

        {/* Grid de Componentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <LiveForm onFormSubmit={handleFormSubmit} />

          <SignatureComponent onSignatureChange={handleSignatureChange} />

          <PdfMerger onPdfMerge={handlePdfMerge} />

          <EmailSender
            defaultRecipient="henrique.danielb@gmail.com"
            onEmailSent={handleEmailSent}
          />

          <EmailEditor onEmailUpdate={handleEmailUpdate} />

          {/* Card de Status */}
          <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Status do Sistema
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Assinatura:
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    activeSignature
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {activeSignature ? "Presente" : "Não definida"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  API Email:
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs font-medium">
                  Configurada
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  PDF Library:
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs font-medium">
                  Ativa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

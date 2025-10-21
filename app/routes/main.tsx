import type { Route } from "./+types/main";
import PdfMerger from "~/components/PdfMerger";
import EmailSender from "~/components/EmailSenderold";
import ImageWithTextOverlay from "~/components/ImageWithTextOverlay";
import LiveForm from "~/components/LiveForm";
import { devLog } from "~/utils/dev-log";

export default function Main() {
  const handlePdfMerge = (mergedPdfBytes: Uint8Array) => {
    devLog.log("PDFs mesclados:", mergedPdfBytes);
  };

  const handleEmailSent = (result: any) => {
    devLog.log("Email enviado:", result);
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
        {/* Projeto completo  */}
        <ImageWithTextOverlay />

        <LiveForm />
        {/* Grid de Componentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <PdfMerger onPdfMerge={handlePdfMerge} />

          <EmailSender
            defaultRecipient="henrique.danielb@gmail.com"
            onEmailSent={handleEmailSent}
          />
        </div>
      </div>
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Transporte App - Viadutos RS" },
    {
      name: "description",
      content: "Edição do Auxílio Transporte para Viadutos RS",
    },
  ];
}

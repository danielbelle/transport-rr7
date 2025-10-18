import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { SignatureComponentProps } from "~/components/types";

export default function SignatureComponent({
  onSignatureChange,
}: SignatureComponentProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleSignatureEnd = () => {
    const canvas = signatureRef.current;
    if (!canvas || canvas.isEmpty()) {
      setSignatureData(null);
      onSignatureChange?.(null);
      return;
    }

    const dataUrl = canvas.toDataURL();
    setSignatureData(dataUrl);
    onSignatureChange?.(dataUrl);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureData(null);
    onSignatureChange?.(null);
  };

  const handleDownloadSignature = () => {
    if (!signatureData) return;

    const link = document.createElement("a");
    link.download = "assinatura.png";
    link.href = signatureData;
    link.click();
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Assinatura Digital
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Área de Desenho */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Desenhe sua assinatura:
          </h3>

          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              onEnd={handleSignatureEnd}
              canvasProps={{
                width: 400,
                height: 200,
                className:
                  "w-full h-50 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700",
              }}
            />
            <div className="p-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Assine na área acima
              </span>
              <button
                onClick={handleClearSignature}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preview da Assinatura:
          </h3>

          {signatureData ? (
            <div className="text-center space-y-4">
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-700">
                <img
                  src={signatureData}
                  alt="Assinatura"
                  className="max-w-full h-auto mx-auto"
                />
              </div>

              <button
                onClick={handleDownloadSignature}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                📥 Download PNG
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-8 text-center bg-gray-50 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                Sua assinatura aparecerá aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

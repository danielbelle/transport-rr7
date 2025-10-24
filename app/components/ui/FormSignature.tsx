import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { FormSignatureProps } from "~/lib/types";

export const FormSignature: React.FC<FormSignatureProps> = ({
  field,
  onSignatureChange,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Dimensões fixas e responsivas para o componente de assinatura
  const signatureWidth = 500; // Largura fixa
  const signatureHeight = 150; // Altura fixa

  const handleSignatureEnd = () => {
    const canvas = signatureRef.current;
    if (!canvas || canvas.isEmpty()) {
      onSignatureChange(field.key, null);
      setIsDrawing(false);
      return;
    }

    const dataUrl = canvas.toDataURL();
    onSignatureChange(field.key, dataUrl);
    setIsDrawing(false);
  };

  const handleSignatureBegin = () => {
    setIsDrawing(true);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    onSignatureChange(field.key, null);
    setIsDrawing(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 overflow-hidden">
        {/* Container responsivo que mantém a proporção */}
        <div
          className="relative w-full bg-white dark:bg-gray-700"
          style={{
            height: "auto",
            aspectRatio: `${signatureWidth} / ${signatureHeight}`,
          }}
        >
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            onBegin={handleSignatureBegin}
            onEnd={handleSignatureEnd}
            canvasProps={{
              width: signatureWidth,
              height: signatureHeight,
              className:
                "w-full h-full absolute top-0 left-0 border-0 bg-white dark:bg-gray-700 cursor-crosshair",
            }}
          />
        </div>

        <div className="p-3 flex justify-between items-center border-t border-gray-300 dark:border-gray-600">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isDrawing ? "Assinando..." : "Assine na área acima"}
          </span>
          <button
            type="button"
            onClick={handleClearSignature}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
};

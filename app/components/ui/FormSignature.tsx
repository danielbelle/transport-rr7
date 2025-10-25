import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { FormSignatureProps } from "~/lib/types";

export const FormSignature: React.FC<
  FormSignatureProps & { initialSignature?: string }
> = ({ field, onSignatureChange, initialSignature = "" }) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Dimensões fixas e responsivas para o componente de assinatura
  const signatureWidth = 500; // Largura fixa
  const signatureHeight = 150; // Altura fixa

  const signatureId = `signature-${field.key}`;

  // Carregar assinatura existente quando o componente montar
  useEffect(() => {
    if (initialSignature && signatureRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = signatureRef.current?.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

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
      <label
        htmlFor={signatureId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 overflow-hidden">
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
              id: signatureId,
              "aria-label": `Área de assinatura para ${field.label}`,
              "aria-describedby": `${signatureId}-description`,
            }}
          />
        </div>

        <div className="p-3 flex justify-between items-center border-t border-gray-300 dark:border-gray-600">
          <span
            id={`${signatureId}-description`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {isDrawing ? "Assinando..." : "Assine na área acima"}
          </span>
          <button
            type="button"
            onClick={handleClearSignature}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            aria-label={`Limpar assinatura de ${field.label}`}
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
};

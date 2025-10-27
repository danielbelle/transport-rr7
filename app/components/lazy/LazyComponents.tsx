import React, { useRef, useState, useEffect } from "react";
import type { FormSignatureProps } from "~/lib/types";
import { LazySignatureCanvas } from "../lazy/LazyComponents";
import Loading from "./Loading";

export const FormSignature: React.FC<
  FormSignatureProps & { initialSignature?: string }
> = ({ field, onSignatureChange, initialSignature = "" }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signatureInstance, setSignatureInstance] = useState<any>(null);

  const signatureWidth = 500;
  const signatureHeight = 150;
  const signatureId = `signature-${field.key}`;

  // Efeito para carregar a assinatura inicial quando o componente estiver pronto
  useEffect(() => {
    if (initialSignature && signatureInstance && isLoading) {
      loadInitialSignature(initialSignature);
      setIsLoading(false);
    }
  }, [initialSignature, signatureInstance, isLoading]);

  const loadInitialSignature = (signatureData: string) => {
    if (!signatureInstance) return;

    const img = new Image();
    img.onload = () => {
      try {
        signatureInstance.clear();
        const canvas = signatureInstance.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      } catch (error) {
        console.error("Erro ao carregar assinatura:", error);
      }
    };
    img.src = signatureData;
  };

  const handleSignatureEnd = () => {
    if (!signatureInstance) return;

    if (signatureInstance.isEmpty()) {
      onSignatureChange(field.key, null);
      setIsDrawing(false);
      return;
    }

    const dataUrl = signatureInstance.toDataURL();
    onSignatureChange(field.key, dataUrl);
    setIsDrawing(false);
  };

  const handleSignatureBegin = () => {
    setIsDrawing(true);
  };

  const handleClearSignature = () => {
    if (signatureInstance) {
      signatureInstance.clear();
      onSignatureChange(field.key, null);
      setIsDrawing(false);
    }
  };

  // Callback quando o canvas é montado
  const handleCanvasRef = (instance: any) => {
    if (instance) {
      setSignatureInstance(instance);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 overflow-hidden">
        <div
          style={{
            width: "100%",
            height: `${signatureHeight}px`,
            position: "relative",
          }}
        >
          <LazySignatureCanvas
            ref={handleCanvasRef}
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

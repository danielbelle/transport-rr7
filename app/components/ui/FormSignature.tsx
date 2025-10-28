import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { FormSignatureProps } from "~/lib/types";
import { useNotification } from "~/lib/notification-context";

export const FormSignature: React.FC<
  FormSignatureProps & { initialSignature?: string }
> = ({ field, onSignatureChange, initialSignature = "" }) => {
  const { addNotification } = useNotification();
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false); // ← Novo estado para controlar se está pronto

  // Dimensões fixas e responsivas para o componente de assinatura
  const signatureWidth = 600;
  const signatureHeight = 150;

  const signatureId = `signature-${field.key}`;

  // Inicializar o componente após montagem
  useEffect(() => {
    setIsReady(true);

    // Cleanup function
    return () => {
      if (signatureRef.current) {
        signatureRef.current.off();
      }
    };
  }, []);

  // Carregar assinatura existente quando o componente montar e estiver pronto
  useEffect(() => {
    if (initialSignature && signatureRef.current && isReady) {
      loadInitialSignature(initialSignature);
    }
  }, [initialSignature, isReady]);

  const loadInitialSignature = (signatureData: string) => {
    if (!signatureRef.current || !isReady) return;

    const img = new Image();
    img.onload = () => {
      try {
        signatureRef.current?.clear();
        const canvas = signatureRef.current?.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      } catch (error) {}
    };
    img.onerror = () => {};
    img.src = signatureData;
  };

  const handleSignatureEnd = () => {
    if (!signatureRef.current || !isReady) return;

    try {
      if (signatureRef.current.isEmpty()) {
        onSignatureChange(field.key, null);
        setIsDrawing(false);
        return;
      }

      const dataUrl = signatureRef.current.toDataURL();
      onSignatureChange(field.key, dataUrl);
      setIsDrawing(false);

      // ✅ NOTIFICAÇÃO DE SUCESSO
      addNotification({
        type: "success",
        message: "Assinatura salva com sucesso!",
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Erro ao salvar assinatura",
        duration: 3000,
      });
    }
  };

  const handleSignatureBegin = () => {
    if (!isReady) return;
    setIsDrawing(true);
  };

  const handleClearSignature = () => {
    if (signatureRef.current && isReady) {
      try {
        signatureRef.current.clear();
        onSignatureChange(field.key, null);
        setIsDrawing(false);

        // ✅ NOTIFICAÇÃO DE INFORMAÇÃO
        addNotification({
          type: "info",
          message: "Assinatura removida",
          duration: 3000,
        });
      } catch (error) {}
    }
  };

  // Se não estiver pronto, mostrar loading
  if (!isReady) {
    return (
      <div className="space-y-3">
        <label
          htmlFor={signatureId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 p-8 text-center">
          <div className="animate-pulse">Carregando área de assinatura...</div>
        </div>
      </div>
    );
  }

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
            height: `${signatureHeight}px`,
            minHeight: `${signatureHeight}px`,
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
            {initialSignature && " ✓ Pronto para editar"}
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

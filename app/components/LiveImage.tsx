import React, { useState, useRef, useEffect } from "react";
import { CanvasPreview } from "~/components/ui/CanvasPreview";
import { fieldConfig } from "~/utils/field-config";
import type {
  TextOverlay,
  LiveImageProps,
  FlexibleFormData,
} from "~/utils/types";

export default function LiveImage({ formData }: LiveImageProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configurações
  const imageUrl = "/samples/sample750.png";
  const canvasWidth = 750;
  const canvasHeight = 750;
  const textColor = "#000000";
  const timeDebounce = 400;

  // Função para criar overlay de texto (usa configurações de IMAGEM)
  function createTextOverlay(
    field: (typeof fieldConfig)[number],
    value: string
  ): TextOverlay {
    return {
      id: field.key,
      text: value,
      x: field.x, // Usa x da imagem
      y: field.y, // Usa y da imagem
      fontSize: field.font, // Usa font da imagem
      color: textColor,
      fieldKey: field.key,
      type: "text",
    };
  }

  // Função para criar overlay de assinatura (usa configurações de IMAGEM)
  function createSignatureOverlay(
    field: (typeof fieldConfig)[number],
    imageData: string
  ): TextOverlay {
    return {
      id: `${field.key}-${Date.now()}`,
      text: "",
      x: field.x, // Usa x da imagem
      y: field.y, // Usa y da imagem
      fontSize: 0,
      color: textColor,
      fieldKey: field.key,
      type: "signature",
      imageData,
    };
  }

  // Atualizar overlays quando formData mudar com debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateImageOverlays();
    }, timeDebounce);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData]);

  // Atualiza todos os overlays da imagem
  function updateImageOverlays() {
    // Converter FormData para FlexibleFormData usando type assertion
    const flexibleFormData = formData as unknown as FlexibleFormData;

    const overlays = fieldConfig
      .filter((field) => !field.hidden)
      .map((field) => {
        const value = flexibleFormData[field.key] || "";

        if (field.type === "signature") {
          // Verificar se é uma data URL de assinatura
          if (value && value.startsWith("data:image/")) {
            return createSignatureOverlay(field, value);
          }
          return null;
        }

        return value.trim() ? createTextOverlay(field, value) : null;
      })
      .filter(Boolean) as TextOverlay[];

    setTextOverlays(overlays);
  }

  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      if (ctx) {
        // Desenhar imagem de fundo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Desenhar textos e assinaturas
        const drawOperations: Promise<void>[] = [];

        textOverlays.forEach((overlay) => {
          if (overlay.type === "signature" && overlay.imageData) {
            const drawPromise = new Promise<void>((resolve) => {
              const signatureImg = new Image();
              signatureImg.onload = () => {
                ctx.drawImage(signatureImg, overlay.x, overlay.y, 300, 100);
                resolve();
              };
              signatureImg.src = overlay.imageData || "";
            });
            drawOperations.push(drawPromise);
          } else if (overlay.text && overlay.text.trim() !== "") {
            ctx.font = `${overlay.fontSize}px Arial`;
            ctx.fillStyle = overlay.color;
            ctx.fillText(overlay.text, overlay.x, overlay.y);
          }
        });

        // Esperar todas as assinaturas carregarem antes de fazer download
        Promise.all(drawOperations).then(() => {
          const link = document.createElement("a");
          link.download = "documento-assinado.png";
          link.href = canvas.toDataURL();
          link.click();
        });
      }
    };

    img.src = imageUrl;
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Visualização da Imagem em Tempo Real
      </h2>

      <div className="space-y-4">
        {/* Preview da Imagem */}
        <CanvasPreview
          imageUrl={imageUrl}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          textOverlays={textOverlays}
        />

        {/* Botão de Download */}
        <button
          onClick={downloadImage}
          disabled={textOverlays.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          📥 Download da Imagem
        </button>

        {/* Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <div>
              <strong>Campos preenchidos:</strong> {textOverlays.length}
            </div>
            <div>
              <strong>Assinaturas:</strong>{" "}
              {textOverlays.filter((o) => o.type === "signature").length}
            </div>
            <div>
              <strong>Configuração:</strong> Usando posições da imagem (x, y,
              font)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

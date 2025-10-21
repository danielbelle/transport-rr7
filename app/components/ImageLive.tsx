import React, { useState, useRef, useEffect } from "react";
import { CanvasPreview } from "~/components/ui/CanvasPreview";
import { fieldConfig } from "~/components/ui/fieldConfig";
import type { TextOverlay, FormData, ImageLiveProps } from "~/utils/types";

export default function ImageLive({ formData }: ImageLiveProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configurações
  const imageUrl = "/samples/sample750.png";
  const canvasWidth = 750;
  const canvasHeight = 750;
  const textColor = "#000000";
  const timeDebounce = 400;

  // Função para criar overlay de texto
  function createTextOverlay(
    field: (typeof fieldConfig)[number],
    value: string
  ): TextOverlay {
    return {
      id: field.key,
      text: value,
      x: field.x,
      y: field.y,
      fontSize: field.font,
      color: textColor,
      fieldKey: field.key,
      type: "text",
    };
  }

  // Atualizar overlays quando formData mudar com debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      updateTextOverlays();
    }, timeDebounce);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData]);

  // Atualiza todos os overlays
  function updateTextOverlays() {
    const overlays = fieldConfig
      .filter((field) => !field.hidden && field.type !== "signature")
      .map((field) => {
        const value = (formData as any)[field.key] || "";
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

        // Desenhar textos
        textOverlays.forEach((overlay) => {
          if (overlay.text && overlay.text.trim() !== "") {
            ctx.font = `${overlay.fontSize}px Arial`;
            ctx.fillStyle = overlay.color;
            ctx.fillText(overlay.text, overlay.x, overlay.y);
          }
        });

        // Fazer download
        const link = document.createElement("a");
        link.download = "documento-preenchido.png";
        link.href = canvas.toDataURL();
        link.click();
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Preview da Imagem:
          </h3>

          <CanvasPreview
            imageUrl={imageUrl}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            textOverlays={textOverlays}
          />
        </div>

        {/* Botão de Download */}
        <button
          type="button"
          onClick={downloadImage}
          disabled={textOverlays.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          📥 Download da Imagem
        </button>

        {/* Debug Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            Dados na Imagem:
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <div>
              <strong>Nome:</strong> {formData.text_nome || "Vazio"}
            </div>
            <div>
              <strong>RG:</strong> {formData.text_rg || "Vazio"}
            </div>
            <div>
              <strong>CPF:</strong> {formData.text_cpf || "Vazio"}
            </div>
            <div>
              <strong>Textos desenhados:</strong> {textOverlays.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

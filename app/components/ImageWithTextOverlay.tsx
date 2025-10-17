import React, { useState, useRef, useEffect } from "react";
import { FieldInput } from "~/components/ui/FieldInput";
import { CanvasPreview } from "~/components/ui/CanvasPreview";
import { fieldConfig } from "~/components/ui/fieldConfig";
import type { TextOverlay, FormData } from "~/components/types/types";

const ImageWithTextOverlay = () => {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configurações
  const imageUrl = "/samples/sample750.png";
  const canvasWidth = 750;
  const canvasHeight = 750;
  const textColor = "#000000";
  const timeDebounce = 500;

  // Atualizar overlays quando formData mudar
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateTextOverlays();
    }, timeDebounce);
  }, [formData]);

  const updateTextOverlays = () => {
    const newOverlays: TextOverlay[] = fieldConfig
      .filter((field) => {
        const text = formData[field.key] || "";
        return text.trim() !== "";
      })
      .map((field) => ({
        id: field.key,
        text: formData[field.key],
        x: field.x,
        y: field.y,
        fontSize: field.font,
        color: textColor,
        fieldKey: field.key,
      }));

    setTextOverlays(newOverlays);
  };

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        textOverlays.forEach((overlay) => {
          if (overlay.text && overlay.text.trim() !== "") {
            ctx.font = `${overlay.fontSize}px Arial`;
            ctx.fillStyle = overlay.color;
            ctx.fillText(overlay.text, overlay.x, overlay.y);
          }
        });

        const link = document.createElement("a");
        link.download = "imagem-com-texto.png";
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = imageUrl;
  };

  const clearAllTexts = () => {
    setTextOverlays([]);
    setFormData({});
  };

  const visibleFields = fieldConfig.filter((field) => !field.hidden);

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Editor de Imagem com Texto
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controles */}
        <div className="space-y-4">
          {visibleFields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              formData={formData}
              onChange={handleFieldChange}
            />
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadImage}
              disabled={textOverlays.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              📥 Download da Imagem
            </button>

            <button
              type="button"
              onClick={clearAllTexts}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
            >
              🗑️ Limpar
            </button>
          </div>
        </div>

        {/* Preview */}
        <CanvasPreview
          imageUrl={imageUrl}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          textOverlays={textOverlays}
        />
      </div>
    </div>
  );
};

export default ImageWithTextOverlay;

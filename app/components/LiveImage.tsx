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
  const imageUrl = "/samples/sample.png";
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
      // ADICIONAR: Usar width e height da configuração do campo
      width: field.width || 300, // Valor padrão de fallback
      height: field.height || 100, // Valor padrão de fallback
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
      </div>
    </div>
  );
}

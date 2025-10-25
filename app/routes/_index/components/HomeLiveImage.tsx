import React, { useState, useRef, useEffect } from "react";
import { CanvasPreview } from "~/components/ui/CanvasPreview";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";
import type {
  TextOverlay,
  LiveImageProps,
  FlexibleFormData,
} from "~/lib/types";

export default function HomeLiveImage({ formData }: LiveImageProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const imageUrl = "/samples/sample.png";
  const canvasWidth = 750;
  const canvasHeight = 750;
  const textColor = "#000000";
  const timeDebounce = 400;

  function createTextOverlay(
    field: (typeof homeFieldConfig)[number],
    value: string
  ): TextOverlay | null {
    // Ignorar campos com font = 0 (não aparecem na imagem)
    if (field.font === 0) return null;

    // Ignorar campos com coordenadas 0,0
    if (field.x === 0 && field.y === 0) return null;

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

  function createSignatureOverlay(
    field: (typeof homeFieldConfig)[number],
    imageData: string
  ): TextOverlay | null {
    // Ignorar campos com coordenadas 0,0
    if (field.x === 0 && field.y === 0) return null;

    return {
      id: `${field.key}-signature`,
      text: "",
      x: field.x,
      y: field.y,
      fontSize: 0,
      color: textColor,
      fieldKey: field.key,
      type: "signature",
      imageData,
      width: field.width || 300,
      height: field.height || 100,
    };
  }

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

  function updateImageOverlays() {
    const flexibleFormData = formData as unknown as FlexibleFormData;

    const overlays = homeFieldConfig
      .filter((field) => !field.hidden)
      .map((field) => {
        const value = flexibleFormData[field.key] || "";

        if (field.type === "signature") {
          // ✅ CORREÇÃO: Garantir que assinatura aparece no canvas
          if (value && value.startsWith("data:image/")) {
            console.log(
              "✅ Assinatura encontrada para canvas:",
              field.key,
              value.substring(0, 50)
            );
            return createSignatureOverlay(field, value);
          } else {
            console.log("❌ Assinatura não encontrada ou inválida:", field.key);
          }
          return null;
        }

        // ✅ CORREÇÃO: Incluir text_repete mesmo se estiver vazio inicialmente
        if (field.key === "text_repete") {
          const nomeValue = flexibleFormData["text_nome"] || "";
          if (nomeValue.trim()) {
            return createTextOverlay(field, nomeValue);
          }
          return null;
        }

        return value.trim() ? createTextOverlay(field, value) : null;
      })
      .filter(Boolean) as TextOverlay[];

    console.log("📊 Overlays no canvas:", overlays.length);
    console.log(
      "🔍 Detalhes dos overlays:",
      overlays.map((ov) => ({
        type: ov.type,
        fieldKey: ov.fieldKey,
        hasImage: ov.type === "signature" ? "SIM" : "NÃO",
        text: ov.text || "vazio",
      }))
    );
    setTextOverlays(overlays);
  }

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Visualização da Imagem em Tempo Real
      </h2>

      <div className="space-y-4">
        <CanvasPreview
          imageUrl={imageUrl}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          textOverlays={textOverlays}
        />

        {/* ✅ DEBUG: Mostrar status da assinatura */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
            🔍 Debug Assinatura
          </h4>
          <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <p>
              <strong>Assinatura no formData:</strong>{" "}
              {formData.signature ? "PRESENTE ✅" : "AUSENTE ❌"}
            </p>
            <p>
              <strong>text_repete:</strong> {formData.text_repete || "vazio"}
            </p>
            <p>
              <strong>text_nome:</strong> {formData.text_nome || "vazio"}
            </p>
            <p>
              <strong>Overlays ativos:</strong> {textOverlays.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

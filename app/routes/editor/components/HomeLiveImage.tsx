import { useState, useRef, useEffect } from "react";
import { CanvasPreview } from "~/components/ui/CanvasPreview";
import { homeFieldConfig } from "~/routes/editor/utils/home-field-config";
import type { TextOverlay, LiveImageProps, TappFormData } from "~/lib/types";

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
    if (field.font === 0) return null;
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
    const overlays = homeFieldConfig
      .filter((field) => !field.hidden)
      .map((field) => {
        const value = formData[field.key as keyof TappFormData] || "";

        if (field.type === "signature") {
          if (value && value.startsWith("data:image/")) {
            return createSignatureOverlay(field, value);
          }
          return null;
        }

        if (field.key === "text_repete") {
          const nomeValue = formData.text_nome || "";
          if (nomeValue.trim()) {
            return createTextOverlay(field, nomeValue);
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

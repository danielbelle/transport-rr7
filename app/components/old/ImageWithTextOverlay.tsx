import React, { useState, useRef, useEffect } from "react";
import { FieldInput } from "~/components/old/FieldInput";
import { CanvasPreview } from "~/components/ui/CanvasPreview";
import { fieldConfig } from "~/utils/fieldConfig";
import type {
  TextOverlay,
  FormData,
  ImageLiveProps,
  FlexibleFormData,
} from "~/utils/types";

export default function ImageLive({ formData }: ImageLiveProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [signatures, setSignatures] = useState<{ [key: string]: string }>({});
  const [localFormData, setLocalFormData] = useState<FlexibleFormData>({
    text_nome: "",
    text_rg: "",
    text_cpf: "",
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const signatureUpdateRef = useRef<number>(0);

  // Configurações
  const imageUrl = "/samples/sample750.png";
  const canvasWidth = 750;
  const canvasHeight = 750;
  const textColor = "#000000";
  const timeDebounce = 400;

  // Sincronizar com formData externo
  useEffect(() => {
    setLocalFormData(formData as FlexibleFormData);
  }, [formData]);

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

  // Função para criar overlay de assinatura
  function createSignatureOverlay(
    field: (typeof fieldConfig)[number],
    imageData: string
  ): TextOverlay {
    return {
      id: `${field.key}-${signatureUpdateRef.current}`,
      text: "",
      x: field.x,
      y: field.y,
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
      updateTextOverlays();
    }, timeDebounce);
  }, [localFormData]);

  // Atualizar overlays imediatamente quando assinaturas mudarem
  useEffect(() => {
    updateTextOverlays();
  }, [signatures]);

  // Atualiza todos os overlays
  function updateTextOverlays() {
    const overlays = fieldConfig
      .filter((field) => !field.hidden)
      .map((field) => {
        if (field.type === "signature") {
          const imageData = signatures[field.key];
          return imageData ? createSignatureOverlay(field, imageData) : null;
        }
        const value = localFormData[field.key as keyof FormData] || "";
        return value.trim() ? createTextOverlay(field, value) : null;
      })
      .filter(Boolean) as TextOverlay[];

    setTextOverlays(overlays);
  }

  const handleFieldChange = (fieldKey: string, value: string) => {
    const newData = {
      ...localFormData,
      [fieldKey]: value,
    };
    setLocalFormData(newData);
  };

  const handleSignatureChange = (
    fieldKey: string,
    signatureData: string | null
  ) => {
    // Incrementar o contador para forçar nova renderização
    signatureUpdateRef.current += 1;

    setSignatures((prev) => {
      if (signatureData === null) {
        const newSignatures = { ...prev };
        delete newSignatures[fieldKey];
        return newSignatures;
      }
      return {
        ...prev,
        [fieldKey]: signatureData,
      };
    });
  };

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
            // Usar Promise para garantir que a imagem seja carregada antes de desenhar
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

  const clearAllTexts = () => {
    setTextOverlays([]);
    setLocalFormData({
      text_nome: "",
      text_rg: "",
      text_cpf: "",
    });
    setSignatures({});
    signatureUpdateRef.current = 0;
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Editor de Documento com Assinatura
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controles */}
        <div className="space-y-6">
          {fieldConfig
            .filter((field) => !field.hidden)
            .map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                formData={localFormData}
                onChange={handleFieldChange}
                onSignatureChange={handleSignatureChange}
              />
            ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadImage}
              disabled={textOverlays.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              📥 Download do Documento
            </button>

            <button
              type="button"
              onClick={clearAllTexts}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
            >
              🗑️ Limpar Tudo
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
}

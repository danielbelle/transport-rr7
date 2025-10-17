import React, { useState, useRef, useEffect } from "react";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fieldKey: string;
}

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "email" | "tel" | "date" | "signature";
  font: number;
  x: number;
  y: number;
  required: boolean;
  hidden?: boolean;
}

interface FormData {
  [key: string]: string;
}

const fieldConfig: FieldConfig[] = [
  {
    key: "text_nome",
    label: "Nome Completo",
    placeholder: "Digite seu nome completo",
    type: "text",
    font: 14,
    x: 123,
    y: 131,
    required: true,
  },
  {
    key: "text_rg",
    label: "RG",
    placeholder: "Digite seu RG",
    type: "number",
    font: 14,
    x: 261,
    y: 168,
    required: true,
  },
  {
    key: "text_cpf",
    label: "CPF",
    placeholder: "Digite seu CPF",
    type: "number",
    font: 16,
    x: 100,
    y: 206,
    required: true,
  },
];

const ImageWithTextOverlay = () => {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  // Carregar imagem de sample.png
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

  useEffect(() => {
    drawCanvas();
  }, [textOverlays]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Desenhar textos
    textOverlays.forEach((overlay) => {
      if (overlay.text && overlay.text.trim() !== "") {
        ctx.font = `${overlay.fontSize}px Arial`;
        ctx.fillStyle = overlay.color;
        ctx.fillText(overlay.text, overlay.x, overlay.y);
      }
    });
  };

  const updateTextOverlays = () => {
    const newOverlays: TextOverlay[] = [];

    // Para cada campo no fieldConfig, criar/atualizar o overlay
    fieldConfig.forEach((field) => {
      const text = formData[field.key] || "";

      if (text.trim() !== "") {
        newOverlays.push({
          id: field.key,
          text: text,
          x: field.x,
          y: field.y,
          fontSize: field.font,
          color: textColor,
          fieldKey: field.key,
        });
      }
    });

    setTextOverlays(newOverlays);
  };

  const removeTextOverlay = (id: string) => {
    // Remove o overlay e limpa o campo correspondente
    setTextOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
    setFormData((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleImageLoad = () => {
    drawCanvas();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "imagem-com-texto.png";
    link.href = canvas.toDataURL();
    link.click();
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
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.key] || ""}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Posição: ({field.x}, {field.y})
              </div>
            </div>
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

        {/* Preview da Imagem com Canvas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preview da Imagem com Texto:
          </h3>

          <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 p-4">
            {/* Imagem oculta para referência */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Base"
              className="hidden"
              onLoad={handleImageLoad}
            />

            {/* Canvas para desenho */}
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full h-auto max-w-full border border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Imagem base: <strong>{imageUrl}</strong>
            </p>
            <p>
              Textos adicionados: <strong>{textOverlays.length}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageWithTextOverlay;

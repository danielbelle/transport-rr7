import React, { useState, useRef, useEffect } from "react";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

const ImageWithTextOverlay = () => {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [isAddingText, setIsAddingText] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar imagem de sample.png
  const imageUrl = "/samples/sample750.png";
  const canvasWidth = 750;
  const canvasHeight = 750;
  const fontSize = 12;
  const textColor = "#000000";
  const timeDebounce = 500;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      canvasWrite();
    }, timeDebounce);
  }, [currentText]);

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
      ctx.font = `${overlay.fontSize}px Arial`;
      ctx.fillStyle = overlay.color;
      ctx.fillText(overlay.text, overlay.x, overlay.y);
    });
  };

  const canvasWrite = () => {
    if (!currentText || currentText.trim() === "") return;

    const points = {
      text_nome: { x: 123, y: 131 },
      text_rg: { x: 261, y: 168 },
      text_cpf: { x: 100, y: 206 },
    };

    const x = points.text_rg.x;
    const y = points.text_rg.y;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: currentText,
      x,
      y,
      fontSize,
      color: textColor,
    };

    setTextOverlays((prev) => [...prev, newOverlay]);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
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

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Editor de Imagem com Texto
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controles */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto para Adicionar
            </label>
            <input
              type="text"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite o texto para adicionar à imagem"
            />
          </div>

          <button
            type="button"
            onClick={downloadImage}
            disabled={textOverlays.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            📥 Download da Imagem
          </button>

          {/* Lista de textos adicionados */}
          {textOverlays.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Textos Adicionados:
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {textOverlays.map((overlay) => (
                  <div
                    key={overlay.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      "{overlay.text} - ({overlay.x}, {overlay.y})"
                    </span>
                    <button
                      onClick={() => removeTextOverlay(overlay.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              className="w-full h-auto max-w-full border border-gray-200 dark:border-gray-600 cursor-crosshair"
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

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
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  const [isAddingText, setIsAddingText] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Carregar imagem de sample-pdf.jpg
  const imageUrl = "/samples/sample-pdf.jpg";

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingText || !currentText.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: currentText,
      x,
      y,
      fontSize,
      color: textColor,
    };

    setTextOverlays((prev) => [...prev, newOverlay]);
    setCurrentText("");
    setIsAddingText(false);
  };

  const handleAddTextClick = () => {
    setIsAddingText(true);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamanho da Fonte
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="8"
                max="72"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor do Texto
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddTextClick}
              disabled={!currentText.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {isAddingText
                ? "Clique na imagem para posicionar"
                : "Adicionar Texto"}
            </button>

            <button
              type="button"
              onClick={() => setIsAddingText(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              Cancelar
            </button>
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
                      "{overlay.text}"
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
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="w-full h-auto max-w-full border border-gray-200 dark:border-gray-600 cursor-crosshair"
              style={{
                cursor: isAddingText ? "crosshair" : "default",
              }}
            />

            {isAddingText && (
              <div className="absolute top-2 left-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-md text-sm">
                Clique na imagem para posicionar o texto
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Imagem base: <strong>sample-pdf.jpg</strong>
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

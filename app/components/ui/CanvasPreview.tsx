import React, { useRef, useEffect } from "react";
import type { TextOverlay } from "~/components/types/types";

interface CanvasPreviewProps {
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  textOverlays: TextOverlay[];
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  imageUrl,
  canvasWidth,
  canvasHeight,
  textOverlays,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Preview da Imagem com Texto:
      </h3>

      <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 p-4">
        <img ref={imageRef} src={imageUrl} alt="Base" className="hidden" />

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
  );
};

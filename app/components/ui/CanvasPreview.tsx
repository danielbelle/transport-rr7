import React, { useRef, useEffect, useState } from "react";
import type { CanvasPreviewProps } from "~/utils/types";

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  imageUrl,
  canvasWidth,
  canvasHeight,
  textOverlays,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

  // Carregar imagem de fundo uma vez
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      backgroundImageRef.current = img;
      setIsBackgroundLoaded(true);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Redesenhar quando overlays mudarem
  useEffect(() => {
    if (isBackgroundLoaded) {
      drawCanvas();
    }
  }, [textOverlays, isBackgroundLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImageRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem de fundo
    ctx.drawImage(
      backgroundImageRef.current,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Desenhar textos e assinaturas
    textOverlays.forEach((overlay) => {
      if (overlay.type === "signature" && overlay.imageData) {
        // Criar imagem para a assinatura
        const signatureImg = new Image();
        signatureImg.onload = () => {
          // USAR AS DIMENSÕES DA CONFIGURAÇÃO DO CAMPO
          const width = overlay.width || 300;
          const height = overlay.height || 100;
          ctx.drawImage(signatureImg, overlay.x, overlay.y, width, height);
        };
        signatureImg.src = overlay.imageData;
      } else if (overlay.text && overlay.text.trim() !== "") {
        // Desenhar texto normal
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
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full h-auto max-w-full border border-gray-200 dark:border-gray-600"
        />
      </div>
    </div>
  );
};

import React, { useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { SignatureFieldProps } from "~/utils/types";

export const SignatureField: React.FC<SignatureFieldProps> = ({
  field,
  onSignatureChange,
}) => {
  const signatureRef = React.useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleSignatureEnd = () => {
    const canvas = signatureRef.current;
    if (!canvas || canvas.isEmpty()) {
      onSignatureChange(field.key, null);
      setIsDrawing(false);
      return;
    }

    const dataUrl = canvas.toDataURL();
    onSignatureChange(field.key, dataUrl);
    setIsDrawing(false);
  };

  const handleSignatureBegin = () => {
    setIsDrawing(true);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    onSignatureChange(field.key, null);
    setIsDrawing(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
      </label>

      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          onBegin={handleSignatureBegin}
          onEnd={handleSignatureEnd}
          canvasProps={{
            width: field.width || 400,
            height: field.height || 200,
            className:
              "w-full border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-crosshair",
          }}
        />
        <div className="p-3 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isDrawing ? "Assinando..." : "Assine na área acima"}
          </span>
          <button
            type="button"
            onClick={handleClearSignature}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Posição na imagem: ({field.x}, {field.y}) | Tamanho:{" "}
        {field.width || 100}x{field.height || 100}
      </div>
    </div>
  );
};

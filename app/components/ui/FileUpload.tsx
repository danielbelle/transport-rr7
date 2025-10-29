import { useState, useRef } from "react";
import type { FileUploadProps } from "~/lib/types";
import { validatePdfFile } from "~/lib/utils";
import { Formatters } from "~/lib/utils/formatters";
import { useNotification } from "~/lib/notification-context";

export function FileUpload({
  onFileSelect,
  accept = ".pdf",
  label = "Selecionar Arquivo",
  required = true,
}: FileUploadProps) {
  const { addNotification } = useNotification();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];

      // Validação com Zod
      const validationResult = validatePdfFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validationResult.success) {
        addNotification({
          type: "error",
          message: validationResult.errors.join(", "),
          duration: 5000,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);

      addNotification({
        type: "success",
        message: `Arquivo "${file.name}" selecionado com sucesso!`,
        duration: 3000,
      });
    } else {
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const handleRemoveFile = () => {
    if (selectedFile) {
      addNotification({
        type: "info",
        message: `Arquivo "${selectedFile.name}" removido`,
        duration: 3000,
      });
    }

    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        htmlFor="file-upload"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
      />

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <span className="text-green-700 dark:text-green-300">
              {selectedFile.name}
            </span>
            <span className="text-sm text-green-600 dark:text-green-400">
              {Formatters.fileSize(selectedFile.size)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {!selectedFile && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Selecione um arquivo PDF para anexar ao formulário
        </p>
      )}
    </div>
  );
}

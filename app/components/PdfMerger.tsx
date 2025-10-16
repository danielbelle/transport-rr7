import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { devLog } from "~/utils/dev-log";

interface PdfMergerProps {
  onPdfMerge?: (mergedPdfBytes: Uint8Array) => void;
}

export default function PdfMerger({ onPdfMerge }: PdfMergerProps) {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      alert("Apenas arquivos PDF são permitidos!");
    }

    if (pdfFiles.length > 0) {
      setPdfFiles((prev) => [...prev, ...pdfFiles.slice(0, 2 - prev.length)]);
    }
  };

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      alert("Selecione pelo menos 2 arquivos PDF para juntar!");
      return;
    }

    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      // Processar cada PDF
      for (const file of pdfFiles) {
        const pdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();

      // Chamar callback se fornecido
      onPdfMerge?.(mergedPdfBytes);

      // CORREÇÃO: Usar any para evitar problemas de tipo
      const blob = new Blob([mergedPdfBytes as any], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "documentos-mesclados.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("PDFs mesclados e baixados com sucesso!");
    } catch (error) {
      devLog.error("Erro ao juntar PDFs:", error);
      alert("Erro ao juntar PDFs. Tente novamente.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Juntar PDFs
      </h2>

      <div className="space-y-6">
        {/* Upload */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selecionar PDFs (máx. 2)
          </label>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={pdfFiles.length >= 2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {pdfFiles.length}/2 arquivos selecionados
          </p>
        </div>

        {/* Lista de Arquivos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Arquivos Selecionados:
          </h3>

          {pdfFiles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum arquivo selecionado
            </p>
          ) : (
            <div className="space-y-2">
              {pdfFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
                >
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    📄 {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Ação */}
        <button
          onClick={mergePdfs}
          disabled={pdfFiles.length < 2 || isMerging}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isMerging ? "🔄 Juntando PDFs..." : "🔄 Juntar e Baixar PDFs"}
        </button>

        {isMerging && (
          <div className="text-center text-blue-600 dark:text-blue-400">
            Processando... Isso pode levar alguns segundos.
          </div>
        )}
      </div>
    </div>
  );
}

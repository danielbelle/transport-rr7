import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { devLog } from "~/utils/dev-log";
import type { PdfMergeWithFormProps } from "~/components/types";

export default function PdfMergeWithForm({
  formPdfBytes,
}: PdfMergeWithFormProps) {
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setUploadedPdf(file);
      } else {
        alert("Por favor, selecione um arquivo PDF!");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const removeFile = () => {
    setUploadedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mergePdfs = async () => {
    if (!formPdfBytes || !uploadedPdf) {
      alert("É necessário ter o PDF do formulário e um PDF enviado!");
      return;
    }

    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      // Adicionar o PDF do formulário (preenchido)
      const formPdfDoc = await PDFDocument.load(formPdfBytes);
      const formPages = await mergedPdf.copyPages(
        formPdfDoc,
        formPdfDoc.getPageIndices()
      );
      formPages.forEach((page) => mergedPdf.addPage(page));

      // Adicionar o PDF enviado pelo usuário
      const uploadedPdfBytes = await uploadedPdf.arrayBuffer();
      const uploadedPdfDoc = await PDFDocument.load(uploadedPdfBytes);
      const uploadedPages = await mergedPdf.copyPages(
        uploadedPdfDoc,
        uploadedPdfDoc.getPageIndices()
      );
      uploadedPages.forEach((page) => mergedPdf.addPage(page));

      const mergedPdfBytes = await mergedPdf.save();

      // Criar download
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "formulario-com-anexo.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL após download
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

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
        Mesclar PDF do Formulário com Anexo
      </h2>

      <div className="space-y-6">
        {/* Upload do PDF externo */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selecionar PDF para Anexar
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Selecione um PDF para anexar ao formulário preenchido
          </p>
        </div>

        {/* Lista de Arquivos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Arquivos para Mesclar:
          </h3>

          <div className="space-y-2">
            {/* PDF do Formulário (sempre presente) */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <span className="text-green-700 dark:text-green-300 truncate">
                📋 Formulário Preenchido
              </span>
              <span className="text-green-600 dark:text-green-400 text-sm">
                ✓ Pronto
              </span>
            </div>

            {/* PDF Uploaded */}
            {uploadedPdf ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <span className="text-blue-700 dark:text-blue-300 truncate">
                  📄 {uploadedPdf.name}
                </span>
                <button
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Nenhum PDF selecionado para anexar
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informações */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
            Como funciona:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li>• O formulário preenchido será a primeira página</li>
            <li>• O PDF anexado será adicionado após o formulário</li>
            <li>• Download automático do PDF mesclado</li>
          </ul>
        </div>

        {/* Botão de Ação */}
        <button
          onClick={mergePdfs}
          disabled={!uploadedPdf || !formPdfBytes || isMerging}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isMerging ? "🔄 Mesclando PDFs..." : "🔄 Mesclar e Baixar PDFs"}
        </button>

        {isMerging && (
          <div className="text-center text-blue-600 dark:text-blue-400">
            Mesclando formulário com anexo...
          </div>
        )}
      </div>
    </div>
  );
}

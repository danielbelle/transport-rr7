import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from "react";
import { PDFDocument } from "pdf-lib";
import { devLog } from "~/utils/dev-log";
import type { PdfMergeWithFormProps, PdfMergeWithFormRef } from "~/utils/types";

const PdfMergeWithForm = forwardRef<PdfMergeWithFormRef, PdfMergeWithFormProps>(
  ({ formPdfBytes, onMergeComplete, onFileSelectionChange }, ref) => {
    const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
    const [isMerging, setIsMerging] = useState(false);
    const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(
      null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CORREÇÃO: Referência para callback externo
    const onFileChangeRef = useRef<((hasFile: boolean) => void) | null>(null);

    // CORREÇÃO: Função para notificar mudanças
    const notifyFileChange = useCallback(
      (hasFile: boolean) => {
        devLog.log("📁 Notificando mudança de arquivo:", hasFile);
        onFileSelectionChange?.(hasFile);
        onFileChangeRef.current?.(hasFile);
      },
      [onFileSelectionChange]
    );

    // Notificar quando a seleção de arquivo mudar
    useEffect(() => {
      notifyFileChange(!!uploadedPdf);
    }, [uploadedPdf, notifyFileChange]);

    // CORREÇÃO: Expor função para receber callback via ref
    useImperativeHandle(
      ref,
      () => ({
        performMerge: async (): Promise<Uint8Array | null> => {
          return await handleMergePdfs();
        },
        getMergedPdfBytes: () => mergedPdfBytes,
        hasUploadedFile: () => !!uploadedPdf,
        // ADICIONAR: Método para registrar callback
        setOnFileChange: (callback: (hasFile: boolean) => void) => {
          onFileChangeRef.current = callback;
          // Notificar estado atual imediatamente
          callback(!!uploadedPdf);
        },
      }),
      [mergedPdfBytes, uploadedPdf]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
          setUploadedPdf(file);
          setMergedPdfBytes(null);
          devLog.log("📁 PDF selecionado para anexar:", file.name);
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
      setMergedPdfBytes(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      devLog.log("📁 PDF anexado removido");
    };

    const handleMergePdfs = async (): Promise<Uint8Array | null> => {
      // CORREÇÃO: Verificar se temos o PDF editado (com dados do formulário)
      if (!formPdfBytes) {
        alert("É necessário preencher o formulário para gerar o PDF editado!");
        return null;
      }

      if (!uploadedPdf) {
        alert("É necessário selecionar um PDF para anexar!");
        return null;
      }

      setIsMerging(true);

      try {
        const mergedPdf = await PDFDocument.create();

        // CORREÇÃO: Usar o PDF editado (formPdfBytes) que já contém os dados preenchidos
        // O formPdfBytes aqui já é o PDF gerado pelo PdfLive com os dados do formulário
        devLog.log("📄 Usando PDF editado com dados do formulário para merge");

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

        const mergedPdfBytesResult = await mergedPdf.save();
        setMergedPdfBytes(mergedPdfBytesResult);

        // Chamar callback com o PDF mesclado
        onMergeComplete?.(mergedPdfBytesResult);

        devLog.log(
          "✅ PDFs mesclados com sucesso! (PDF editado + PDF anexado)"
        );
        return mergedPdfBytesResult;
      } catch (error) {
        devLog.error("❌ Erro ao juntar PDFs:", error);
        alert("Erro ao juntar PDFs. Tente novamente.");
        return null;
      } finally {
        setIsMerging(false);
      }
    };

    return (
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Mesclar PDFs
        </h2>

        <div className="space-y-6">
          {/* Upload do PDF externo */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecionar PDF para Anexar *
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
              {/* PDF do Formulário */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-300 truncate">
                  📋 Formulário Preenchido
                </span>
                <span className="text-green-600 dark:text-green-400 text-sm">
                  {formPdfBytes
                    ? "✓ Pronto (Editado)"
                    : "⏳ Aguardando dados..."}
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

          {/* Status do Merge */}
          <div
            className={`p-4 rounded-md border ${
              formPdfBytes && uploadedPdf
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            }`}
          >
            <h4
              className={`font-medium mb-2 ${
                formPdfBytes && uploadedPdf
                  ? "text-green-800 dark:text-green-300"
                  : "text-yellow-800 dark:text-yellow-300"
              }`}
            >
              {formPdfBytes && uploadedPdf
                ? "✅ PDFs Prontos para Merge"
                : "⏳ Aguardando PDFs"}
            </h4>
            <div
              className={`text-sm space-y-1 ${
                formPdfBytes && uploadedPdf
                  ? "text-green-700 dark:text-green-400"
                  : "text-yellow-700 dark:text-yellow-400"
              }`}
            >
              <div>
                <strong>Status:</strong>{" "}
                {formPdfBytes && uploadedPdf
                  ? "Pronto para envio por email"
                  : "Preencha o formulário e selecione um PDF para anexar"}
              </div>
              {formPdfBytes && (
                <div>
                  <strong>Formulário:</strong> ✓ Editado com dados preenchidos
                </div>
              )}
              {isMerging && (
                <div className="text-blue-600 dark:text-blue-400">
                  🔄 Realizando merge...
                </div>
              )}
              {mergedPdfBytes && (
                <div className="text-green-600 dark:text-green-400">
                  ✅ Merge realizado (PDF editado + anexo)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default PdfMergeWithForm;

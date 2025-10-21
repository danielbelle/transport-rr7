import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { devLog } from "~/utils/dev-log";
import type { PdfLiveProps, FormData, PdfLiveRef } from "~/components/types";
import { fieldConfig } from "~/components/ui/fieldConfig";

const PdfLive = forwardRef<PdfLiveRef, PdfLiveProps>(
  ({ formData, onPdfGenerated }, ref) => {
    const [isLoadingPdf, setIsLoadingPdf] = useState(true);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const templateBytesRef = useRef<ArrayBuffer | null>(null);
    const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentPdfBytesRef = useRef<Uint8Array | null>(null);

    // Carregar o template apenas uma vez
    const loadPdfTemplate = useCallback(async (): Promise<ArrayBuffer> => {
      if (templateBytesRef.current) {
        return templateBytesRef.current;
      }

      try {
        setIsLoadingPdf(true);
        const pdfUrl = "/samples/sample.pdf";
        const response = await fetch(pdfUrl);

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar PDF: ${response.status} ${response.statusText}`
          );
        }

        const existingPdfBytes = await response.arrayBuffer();
        templateBytesRef.current = existingPdfBytes;

        devLog.log("PDF template carregado com sucesso!");
        return existingPdfBytes;
      } catch (error) {
        devLog.error("Erro ao carregar PDF template:", error);
        throw error;
      } finally {
        setIsLoadingPdf(false);
      }
    }, []);

    // Função para gerar o PDF com os dados atuais
    const generatePdfPreview = useCallback(async (): Promise<string | null> => {
      try {
        const templateBytes = await loadPdfTemplate();
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const pageHeight = page.getHeight();

        // Desenhar texto nas posições definidas
        fieldConfig.forEach((field) => {
          const value = (formData as any)[field.key];
          if (value && value.trim() !== "") {
            page.drawText(value, {
              x: field.x,
              y: pageHeight - field.y,
              size: field.font,
              color: rgb(0, 0, 0),
            });
          }
        });

        const pdfBytes = await pdfDoc.save();
        currentPdfBytesRef.current = pdfBytes; // Armazena os bytes atuais

        // Criar URL para o PDF
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);

        // Atualizar estado de forma segura
        setPdfPreviewUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return url;
        });

        onPdfGenerated?.(url);
        return url;
      } catch (error) {
        devLog.error("Erro ao gerar preview do PDF:", error);
        return null;
      }
    }, [formData, loadPdfTemplate, onPdfGenerated]);

    // Função para forçar geração do PDF (nova)
    const generatePdf = async (): Promise<Uint8Array | null> => {
      try {
        devLog.log("🔄 Forçando geração do PDF...");
        await generatePdfPreview();
        return currentPdfBytesRef.current;
      } catch (error) {
        devLog.error("Erro ao forçar geração do PDF:", error);
        return null;
      }
    };

    // Expor métodos para o componente pai via ref
    useImperativeHandle(
      ref,
      () => ({
        getCurrentPdfBytes: () => currentPdfBytesRef.current,
        generatePdf: generatePdf, // NOVO MÉTODO EXPOSTO
      }),
      [generatePdf]
    );

    // Atualizar preview quando os dados do formulário mudarem
    useEffect(() => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }

      previewTimeoutRef.current = setTimeout(() => {
        generatePdfPreview();
      }, 300);

      return () => {
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current);
        }
      };
    }, [formData, generatePdfPreview]);

    // Carregar template inicial
    useEffect(() => {
      generatePdfPreview();

      // Cleanup
      return () => {
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current);
        }
        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
        }
      };
    }, []);

    const handleDownloadPdf = async () => {
      try {
        const url = await generatePdfPreview();
        if (url) {
          const link = document.createElement("a");
          link.href = url;
          link.download = "declaracao-preenchida.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        devLog.error("Erro ao baixar PDF:", error);
        alert("Erro ao gerar PDF. Tente novamente.");
      }
    };

    return (
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Visualização do PDF em Tempo Real
        </h2>

        <div className="space-y-4">
          {/* Preview do PDF */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Preview do PDF:
            </h3>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-600">
              {pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded-md"
                  title="Preview do PDF"
                  key={pdfPreviewUrl}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-500 dark:text-gray-400">
                    {isLoadingPdf ? "Carregando PDF..." : "Gerando preview..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Download */}
          <button
            onClick={handleDownloadPdf}
            disabled={isLoadingPdf}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
          >
            {isLoadingPdf ? "Carregando PDF..." : "📥 Baixar Declaração"}
          </button>
        </div>
      </div>
    );
  }
);

export default PdfLive;

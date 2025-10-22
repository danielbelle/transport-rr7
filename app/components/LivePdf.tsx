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
import type {
  LivePdfProps,
  FormData,
  PdfLiveRef,
  FlexibleFormData,
  FieldConfig,
} from "~/utils/types";
import { fieldConfig } from "~/utils/field-config";

const LivePdf = forwardRef<PdfLiveRef, LivePdfProps>(
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

    // Função para converter data URL para Uint8Array
    const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
      const base64 = dataUrl.split(",")[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };

    // Função para adicionar imagem ao PDF (usa configurações de PDF)
    const addImageToPdf = async (
      pdfDoc: PDFDocument,
      imageData: string,
      field: FieldConfig
    ) => {
      try {
        // Converter data URL para Uint8Array
        const imageBytes = dataUrlToUint8Array(imageData);

        // Determinar o tipo de imagem baseado no data URL
        let image;
        if (imageData.startsWith("data:image/png")) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (
          imageData.startsWith("data:image/jpeg") ||
          imageData.startsWith("data:image/jpg")
        ) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          devLog.warn(
            "Formato de imagem não suportado para assinatura:",
            imageData.substring(0, 50)
          );
          return;
        }

        const pages = pdfDoc.getPages();
        const page = pages[0];
        const pageHeight = page.getHeight();

        // Usar configurações específicas do PDF (xPdf, yPdf, width, height)
        const x = field.xPdf || field.x;
        const y = field.yPdf || field.y;
        const width = 100;
        const height = 50;

        // Desenhar a imagem no PDF
        page.drawImage(image, {
          x: x,
          y: pageHeight - y - height, // Ajustar coordenada Y (PDF-lib usa coordenadas de baixo para cima)
          width: width,
          height: height,
        });
      } catch (error) {
        devLog.error("❌ Erro ao adicionar assinatura ao PDF:", error);
      }
    };

    // Função para gerar o PDF com os dados atuais (usa configurações de PDF)
    const generatePdfPreview = useCallback(async (): Promise<string | null> => {
      try {
        const templateBytes = await loadPdfTemplate();
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const pageHeight = page.getHeight();

        // Converter FormData para FlexibleFormData usando type assertion
        const flexibleFormData = formData as unknown as FlexibleFormData;

        // Desenhar texto nas posições definidas (usa configurações de PDF)
        fieldConfig.forEach((field) => {
          if (field.type === "signature") {
            // Processar assinaturas separadamente
            const signatureData = flexibleFormData[field.key];
            if (signatureData && signatureData.startsWith("data:image/")) {
              // A assinatura será adicionada posteriormente via addImageToPdf
              return;
            }
          } else {
            // Processar campos de texto normais - usa configurações de PDF
            const value = flexibleFormData[field.key];
            if (value && value.trim() !== "") {
              const fontSize = field.fontPdf || field.font;
              const x = field.xPdf || field.x;
              const y = field.yPdf || field.y;

              page.drawText(value, {
                x: x,
                y: pageHeight - y, // Ajustar coordenada Y
                size: fontSize,
                color: rgb(0, 0, 0),
              });
            }
          }
        });

        // Adicionar assinaturas após o texto (usa configurações de PDF)
        for (const field of fieldConfig) {
          if (field.type === "signature") {
            const signatureData = flexibleFormData[field.key];
            if (signatureData && signatureData.startsWith("data:image/")) {
              await addImageToPdf(pdfDoc, signatureData, field);
            }
          }
        }

        const pdfBytes = await pdfDoc.save();
        currentPdfBytesRef.current = pdfBytes;

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

    // Função generatePdf separada e independente (usa configurações de PDF)
    const generatePdf = useCallback(async (): Promise<Uint8Array | null> => {
      try {
        devLog.log("🔄 Forçando geração do PDF...");

        // Gerar PDF diretamente sem chamar generatePdfPreview
        const templateBytes = await loadPdfTemplate();
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const pageHeight = page.getHeight();

        const flexibleFormData = formData as unknown as FlexibleFormData;

        // Desenhar texto (usa configurações de PDF)
        fieldConfig.forEach((field) => {
          if (field.type === "signature") {
            // Assinaturas serão processadas separadamente
            return;
          }

          const value = flexibleFormData[field.key];
          if (value && value.trim() !== "") {
            const fontSize = field.fontPdf || field.font;
            const x = field.xPdf || field.x;
            const y = field.yPdf || field.y;

            page.drawText(value, {
              x: x,
              y: pageHeight - y,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
          }
        });

        // Adicionar assinaturas (usa configurações de PDF)
        for (const field of fieldConfig) {
          if (field.type === "signature") {
            const signatureData = flexibleFormData[field.key];
            if (signatureData && signatureData.startsWith("data:image/")) {
              await addImageToPdf(pdfDoc, signatureData, field);
            }
          }
        }

        const pdfBytes = await pdfDoc.save();
        currentPdfBytesRef.current = pdfBytes;

        return pdfBytes;
      } catch (error) {
        devLog.error("Erro ao forçar geração do PDF:", error);
        return null;
      }
    }, [formData, loadPdfTemplate]);

    // Expor métodos para o componente pai via ref
    useImperativeHandle(
      ref,
      () => ({
        getCurrentPdfBytes: () => currentPdfBytesRef.current,
        generatePdf: generatePdf,
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
          link.download = "documento-preenchido.pdf";
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
            {isLoadingPdf ? "Carregando PDF..." : "📥 Baixar Documento PDF"}
          </button>

          {/* Informações */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <div>
                <strong>Template:</strong> sample.pdf
              </div>
              <div>
                <strong>Campos:</strong> Nome, RG, CPF, Assinatura
              </div>
              <div>
                <strong>Assinatura:</strong>{" "}
                {formData.signature ? "✓ Incluída" : "⏳ Aguardando"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {currentPdfBytesRef.current ? "✓ Pronto" : "⏳ Gerando..."}
              </div>
              <div>
                <strong>Configuração:</strong> Usando posições do PDF (xPdf,
                yPdf, fontPdf)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default LivePdf;

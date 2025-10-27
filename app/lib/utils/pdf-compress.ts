import { PDFDocument } from "pdf-lib";
import type { PdfCompressResult, CompressionInfo } from "~/lib/types";
import { Logger } from "~/lib/utils/logger";

/**
 * Calcula o tamanho estimado do email incluindo HTML e anexos
 */
export const calculateEmailSize = (
  htmlContent: string,
  attachments: any[] = []
): number => {
  const htmlSize = new Blob([htmlContent]).size;
  const attachmentsSize = attachments.reduce((total, attachment) => {
    return total + (attachment.content ? atob(attachment.content).length : 0);
  }, 0);

  const overhead = 1024;
  return htmlSize + attachmentsSize + overhead;
};

/**
 * Verifica se o PDF precisa de compressão considerando o limite total de 15MB
 */
export const needsCompression = (
  pdfBytes: Uint8Array,
  emailHtml: string,
  otherAttachments: any[] = []
): boolean => {
  const pdfSize = pdfBytes.length;
  const emailSize = calculateEmailSize(emailHtml, otherAttachments);
  const totalSize = pdfSize + emailSize;
  const limitBytes = 15 * 1024 * 1024;

  return totalSize > limitBytes;
};

/**
 * Compressão básica do PDF - re-salva com otimizações
 */
export const compressPdfBasic = async (
  pdfBytes: Uint8Array
): Promise<Uint8Array> => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
      updateFieldAppearances: false,
    });

    return compressedBytes;
  } catch (error) {
    Logger.error("Erro na compressão básica do PDF:", error);
    throw error;
  }
};

/**
 * Função principal de compressão de PDF com callback de progresso
 */
export const compressPdf = async (
  pdfBytes: Uint8Array,
  onProgress?: (info: CompressionInfo) => void
): Promise<PdfCompressResult> => {
  const originalSize = pdfBytes.length;
  let compressedBytes = pdfBytes;

  try {
    compressedBytes = await compressPdfBasic(pdfBytes);

    const finalSize = compressedBytes.length;
    const compressionRatio = ((originalSize - finalSize) / originalSize) * 100;
    const success = finalSize <= 15 * 1024 * 1024;

    const compressionInfo: CompressionInfo = {
      originalSize,
      compressedSize: finalSize,
      compressionRatio,
      success,
      message: success
        ? `PDF comprimido com sucesso (${compressionRatio.toFixed(
            1
          )}% de redução)`
        : `PDF ainda grande após compressão (${(
            finalSize /
            1024 /
            1024
          ).toFixed(2)} MB)`,
    };

    onProgress?.(compressionInfo);
    Logger.log("Compressão PDF concluída:", compressionInfo);

    return {
      compressedBytes,
      info: compressionInfo,
    };
  } catch (error) {
    const errorInfo: CompressionInfo = {
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      success: false,
      message: "Erro na compressão - usando PDF original",
    };

    onProgress?.(errorInfo);
    Logger.error("Erro na compressão do PDF:", error);

    return {
      compressedBytes: pdfBytes,
      info: errorInfo,
    };
  }
};

/**
 * Utilitários de compressão de PDF
 */
export const PdfCompressUtils = {
  compressPdf,
  compressPdfBasic,
  needsCompression,
  calculateEmailSize,
};

export default PdfCompressUtils;

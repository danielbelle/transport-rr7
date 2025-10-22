import { PDFDocument } from "pdf-lib";
import { devLog } from "~/utils/dev-log";
import type { PdfCompressResult, CompressionInfo } from "~/utils/types";

// Calcular tamanho estimado do email (HTML + outros conteúdos)
export const calculateEmailSize = (
  htmlContent: string,
  attachments: any[] = []
): number => {
  const htmlSize = new Blob([htmlContent]).size;
  const attachmentsSize = attachments.reduce((total, attachment) => {
    return total + (attachment.content ? atob(attachment.content).length : 0);
  }, 0);

  // Adicionar margem para headers e outros dados do email
  const overhead = 1024; // ~1KB para headers e metadados

  return htmlSize + attachmentsSize + overhead;
};

// Verificar se precisa de compressão considerando o limite total de 15MB
export const needsCompression = (
  pdfBytes: Uint8Array,
  emailHtml: string,
  otherAttachments: any[] = []
): boolean => {
  const pdfSize = pdfBytes.length;
  const emailSize = calculateEmailSize(emailHtml, otherAttachments);
  const totalSize = pdfSize + emailSize;
  const limitBytes = 15 * 1024 * 1024; // 15MB em bytes

  devLog.log("📊 Análise de tamanho do email:", {
    pdfSize: `${(pdfSize / 1024 / 1024).toFixed(2)} MB`,
    emailSize: `${(emailSize / 1024 / 1024).toFixed(2)} MB`,
    totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    limite: "15 MB",
    precisaComprimir: totalSize > limitBytes,
  });

  return totalSize > limitBytes;
};

// Compressão básica - re-salvar o PDF com otimizações
export const compressPdfBasic = async (
  pdfBytes: Uint8Array
): Promise<Uint8Array> => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Re-salvar com configurações otimizadas para redução de tamanho
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true, // Agrupar objetos para compactação
      addDefaultPage: false, // Não adicionar página extra
      objectsPerTick: 50, // Processar menos objetos por tick para economia de memória
      updateFieldAppearances: false, // Não atualizar aparências de campos (economiza espaço)
    });

    return compressedBytes;
  } catch (error) {
    devLog.error("❌ Erro na compressão básica:", error);
    throw error;
  }
};

// Função principal de compressão
export const compressPdf = async (
  pdfBytes: Uint8Array,
  onProgress?: (info: CompressionInfo) => void
): Promise<PdfCompressResult> => {
  const originalSize = pdfBytes.length;
  let compressedBytes = pdfBytes;
  let attempts = 0;
  const maxAttempts = 2;

  try {
    devLog.log("🔄 Iniciando compressão do PDF...", {
      tamanhoOriginal: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
    });

    // Compressão básica
    attempts++;
    compressedBytes = await compressPdfBasic(pdfBytes);

    const basicCompressionRatio =
      ((originalSize - compressedBytes.length) / originalSize) * 100;

    devLog.log("📦 Resultado compressão básica:", {
      tamanho: `${(compressedBytes.length / 1024 / 1024).toFixed(2)} MB`,
      redução: `${basicCompressionRatio.toFixed(1)}%`,
    });

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
    devLog.log("✅ Processo de compressão finalizado:", compressionInfo);

    return {
      compressedBytes,
      info: compressionInfo,
    };
  } catch (error) {
    devLog.error("❌ Erro no processo de compressão:", error);

    const errorInfo: CompressionInfo = {
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      success: false,
      message: "Erro na compressão - usando PDF original",
    };

    onProgress?.(errorInfo);

    // Em caso de erro, retorna o original
    return {
      compressedBytes: pdfBytes,
      info: errorInfo,
    };
  }
};

// Exportar todas as funções como um objeto utilitário
export const PdfCompressUtils = {
  compressPdf,
  compressPdfBasic,
  needsCompression,
  calculateEmailSize,
};

export default PdfCompressUtils;

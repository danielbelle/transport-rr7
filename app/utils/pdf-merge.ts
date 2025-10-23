import { PDFDocument } from "pdf-lib";
import { devLog } from "~/utils/dev-log";

export interface PdfMergeResult {
  mergedBytes: Uint8Array;
  pageCount: number;
  totalSize: number;
}

export class PdfMergeUtils {
  static async mergePdfs(
    formPdfBytes: Uint8Array,
    uploadedPdfBytes: Uint8Array
  ): Promise<PdfMergeResult> {
    try {
      devLog.log("🔄 Iniciando merge de PDFs...");

      const mergedPdf = await PDFDocument.create();

      // Adicionar PDF do formulário
      const formPdfDoc = await PDFDocument.load(formPdfBytes);
      const formPages = await mergedPdf.copyPages(
        formPdfDoc,
        formPdfDoc.getPageIndices()
      );
      formPages.forEach((page) => mergedPdf.addPage(page));

      // Adicionar PDF anexado
      const uploadedPdfDoc = await PDFDocument.load(uploadedPdfBytes);
      const uploadedPages = await mergedPdf.copyPages(
        uploadedPdfDoc,
        uploadedPdfDoc.getPageIndices()
      );
      uploadedPages.forEach((page) => mergedPdf.addPage(page));

      const mergedBytes = await mergedPdf.save();

      const result: PdfMergeResult = {
        mergedBytes,
        pageCount: formPages.length + uploadedPages.length,
        totalSize: mergedBytes.length,
      };

      devLog.log("✅ Merge concluído", result);
      return result;
    } catch (error) {
      devLog.error("❌ Erro no merge de PDFs:", error);
      throw new Error(
        `Falha no merge: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  static formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}

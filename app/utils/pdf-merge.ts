import { PDFDocument } from "pdf-lib";
import type { PdfMergeResult } from "~/utils/types";

/**
 * Utilitários para merge de PDFs
 */
export class PdfMergeUtils {
  /**
   * Realiza o merge de dois PDFs (formulário + anexo)
   * @param formPdfBytes Bytes do PDF do formulário preenchido
   * @param uploadedPdfBytes Bytes do PDF anexado pelo usuário
   * @returns Objeto com PDF mesclado e informações do resultado
   */
  static async mergePdfs(
    formPdfBytes: Uint8Array,
    uploadedPdfBytes: Uint8Array
  ): Promise<PdfMergeResult> {
    try {
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

      return result;
    } catch (error) {
      throw new Error(
        `Falha no merge: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Formata bytes para formato legível (MB)
   * @param bytes Quantidade de bytes
   * @returns String formatada em MB
   */
  static formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}

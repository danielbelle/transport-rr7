import { PDFDocument, rgb } from "pdf-lib";
import { homeFieldConfig } from "~/routes/_index/utils/home-field-config";
import type { FormData, FlexibleFormData, FieldConfig } from "~/lib/types";

/**
 * Gera PDF editado com os dados do formulário (versão utilitária do LivePdf)
 * @param formData Dados do formulário preenchidos
 * @returns Promise<Uint8Array> PDF gerado em bytes
 */
export async function generateFormPdf(formData: FormData): Promise<Uint8Array> {
  try {
    // Carregar template PDF
    const templateBytes = await loadPdfTemplate();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const pageHeight = page.getHeight();

    // Converter FormData para FlexibleFormData
    const flexibleFormData = formData as unknown as FlexibleFormData;

    // Processar campos de texto
    homeFieldConfig.forEach((field) => {
      if (field.type === "signature") return; // Assinaturas processadas separadamente

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
    });

    // Processar assinaturas
    const signaturePromises = homeFieldConfig
      .filter((field) => field.type === "signature")
      .map(async (field) => {
        const signatureData = flexibleFormData[field.key];
        if (signatureData && signatureData.startsWith("data:image/")) {
          await addSignatureToPdf(pdfDoc, signatureData, field);
        }
      });

    // Aguardar todas as assinaturas serem processadas
    await Promise.all(signaturePromises);

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  } catch (error) {
    throw new Error(
      `Falha na geração do PDF: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

/**
 * Carrega o template PDF uma vez (com cache)
 * @returns Promise<ArrayBuffer> Bytes do template PDF
 */
async function loadPdfTemplate(): Promise<ArrayBuffer> {
  try {
    const pdfUrl = "/samples/sample.pdf";
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar template: ${response.status} ${response.statusText}`
      );
    }

    return await response.arrayBuffer();
  } catch (error) {
    throw new Error(
      `Não foi possível carregar o template PDF: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

/**
 * Adiciona assinatura ao PDF
 * @param pdfDoc Documento PDF
 * @param imageData Data URL da imagem da assinatura
 * @param field Configuração do campo de assinatura
 * @returns Promise<void>
 */
async function addSignatureToPdf(
  pdfDoc: PDFDocument,
  imageData: string,
  field: FieldConfig
): Promise<void> {
  try {
    // Validar formato da assinatura
    if (!imageData || !imageData.startsWith("data:image/")) {
      throw new Error("Formato de assinatura inválido");
    }

    const imageBytes = dataUrlToUint8Array(imageData);
    let image;

    // Determinar tipo de imagem baseado no data URL
    if (imageData.startsWith("data:image/png")) {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (
      imageData.startsWith("data:image/jpeg") ||
      imageData.startsWith("data:image/jpg")
    ) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error(
        "Formato de imagem não suportado para assinatura. Use PNG ou JPEG."
      );
    }

    const pages = pdfDoc.getPages();
    const page = pages[0];
    const pageHeight = page.getHeight();

    // Usar configurações específicas do PDF para assinatura
    const x = field.xPdf || field.x;
    const y = field.yPdf || field.y;
    const width = field.width || 100;
    const height = field.height || 50;

    // Desenhar a imagem da assinatura no PDF
    page.drawImage(image, {
      x: x,
      y: pageHeight - y - height, // Ajuste importante para coordenada Y
      width: width,
      height: height,
    });
  } catch (error) {
    throw new Error(
      `Falha ao processar assinatura: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

/**
 * Converte data URL para Uint8Array
 * @param dataUrl Data URL da imagem
 * @returns Uint8Array com bytes da imagem
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  try {
    if (!dataUrl.includes(",")) {
      throw new Error("Data URL malformada");
    }

    const base64 = dataUrl.split(",")[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    throw new Error(
      "Formato de assinatura inválido: " +
        (error instanceof Error ? error.message : "Erro na conversão")
    );
  }
}

/**
 * Utilitários para edição de formulários em PDF
 */
export const PdfFormEdit = {
  generateFormPdf,
};

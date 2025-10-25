import { PDFDocument, rgb } from "pdf-lib";
import { homeFieldConfig } from "./home-field-config";
import type { FormData, FlexibleFormData, FieldConfig } from "~/lib/types";

/**
 * Gera PDF editado com os dados do formulário - ESPECÍFICO para home
 */
export async function generateHomeFormPdf(
  formData: FormData
): Promise<Uint8Array> {
  try {
    const templateBytes = await loadPdfTemplate();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const pageHeight = page.getHeight();

    const flexibleFormData = formData as unknown as FlexibleFormData;

    console.log("📊 Dados sendo processados no PDF:", flexibleFormData); // ✅ DEBUG

    // Processar campos de texto específicos da home
    homeFieldConfig.forEach((field) => {
      if (field.type === "signature") return;

      const value = flexibleFormData[field.key];

      // ✅ GARANTIR que text_repete aparece mesmo se estiver vazio
      if (value && value.toString().trim() !== "") {
        // Ignorar campos com fontPdf = 0 (não aparecem no PDF)
        if (field.fontPdf === 0) {
          console.log(`❌ Campo ${field.key} ignorado (fontPdf = 0)`);
          return;
        }

        // Ignorar campos com coordenadas 0,0
        if (field.xPdf === 0 && field.yPdf === 0) {
          console.log(`❌ Campo ${field.key} ignorado (coordenadas 0,0)`);
          return;
        }

        const fontSize = field.fontPdf || field.font;
        const x = field.xPdf || field.x;
        const y = field.yPdf || field.y;

        console.log(
          `✅ Adicionando campo ${field.key}: "${value}" em (${x}, ${y})`
        );

        page.drawText(value.toString(), {
          x: x,
          y: pageHeight - y,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      } else {
        console.log(`❌ Campo ${field.key} vazio ou não definido`);
      }
    });

    // Processar assinaturas específicas da home
    const signaturePromises = homeFieldConfig
      .filter((field) => field.type === "signature")
      .map(async (field) => {
        const signatureData = flexibleFormData[field.key];
        if (signatureData && signatureData.startsWith("data:image/")) {
          // Ignorar assinaturas com coordenadas 0,0
          if (field.xPdf === 0 && field.yPdf === 0) return;

          console.log(`✅ Processando assinatura para campo ${field.key}`);
          await addSignatureToPdf(pdfDoc, signatureData, field);
        } else {
          console.log(`❌ Assinatura não encontrada para ${field.key}`);
        }
      });

    await Promise.all(signaturePromises);
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("❌ Erro na geração do PDF:", error);
    throw new Error(
      `Falha na geração do PDF: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

// Resto do código permanece igual...
/**
 * Carrega template PDF específico da home
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
 * Adiciona assinatura ao PDF - específico para home
 */
async function addSignatureToPdf(
  pdfDoc: PDFDocument,
  imageData: string,
  field: FieldConfig
): Promise<void> {
  try {
    if (!imageData || !imageData.startsWith("data:image/")) {
      throw new Error("Formato de assinatura inválido");
    }

    const imageBytes = dataUrlToUint8Array(imageData);
    let image;

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

    const x = field.xPdf || field.x;
    const y = field.yPdf || field.y;
    const width = field.width || 100;
    const height = field.height || 50;

    page.drawImage(image, {
      x: x,
      y: pageHeight - y - height,
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

import { useState, useEffect, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { devLog } from "~/utils/dev-log";

interface AcroFormPosition {
  x: number;
  y: number;
  page: number;
  field: string;
}

// Posições ajustadas para o seu PDF sample.pdf (origem no canto superior esquerdo)
const SAMPLE_POSITIONS: Record<string, AcroFormPosition> = {
  nome: { x: 110, y: 705, page: 0, field: "nome" },
  rg: { x: 280, y: 700, page: 0, field: "rg" },
  cpf: { x: 280, y: 680, page: 0, field: "cpf" },
};

interface LiveFormProps {
  onFormSubmit?: (data: { nome: string; rg: string; cpf: string }) => void;
}

export default function LiveForm({ onFormSubmit }: LiveFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    rg: "",
    cpf: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    onFormSubmit?.(formData);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  // Função para carregar o PDF template
  const loadPdfTemplate = async (): Promise<PDFDocument> => {
    try {
      setIsLoadingPdf(true);

      // Carregar o PDF template do diretório public
      const pdfUrl = "/samples/sample.pdf";
      const existingPdfBytes = await fetch(pdfUrl).then((res) => {
        if (!res.ok) {
          throw new Error(
            `Erro ao carregar PDF: ${res.status} ${res.statusText}`
          );
        }
        return res.arrayBuffer();
      });

      // Carregar o PDF existente
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      devLog.log("PDF template carregado com sucesso!");
      return pdfDoc;
    } catch (error) {
      devLog.error("Erro ao carregar PDF template:", error);
      // Se falhar ao carregar o template, criar um novo PDF
      devLog.log("Criando novo PDF...");
      return await PDFDocument.create();
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Função para gerar o PDF com os dados atuais
  const generatePdfPreview = async () => {
    try {
      // Carregar o PDF template
      const pdfDoc = await loadPdfTemplate();

      // Se o PDF for novo (não carregou o template), adicionar uma página
      const pages = pdfDoc.getPages();
      const page = pages.length > 0 ? pages[0] : pdfDoc.addPage([612, 792]);

      // Preencher os campos do AcroForm se existirem
      const form = pdfDoc.getForm();

      try {
        // Tentar preencher os campos do AcroForm
        const nomeField = form.getTextField("nome");
        if (nomeField && formData.nome) {
          nomeField.setText(formData.nome);
        }
      } catch (error) {
        devLog.log("Campo 'nome' não encontrado no AcroForm, usando fallback");
      }

      try {
        const rgField = form.getTextField("rg");
        if (rgField && formData.rg) {
          rgField.setText(formData.rg);
        }
      } catch (error) {
        devLog.log("Campo 'rg' não encontrado no AcroForm, usando fallback");
      }

      try {
        const cpfField = form.getTextField("cpf");
        if (cpfField && formData.cpf) {
          cpfField.setText(formData.cpf);
        }
      } catch (error) {
        devLog.log("Campo 'cpf' não encontrado no AcroForm, usando fallback");
      }

      // Fallback: se não houver AcroForm, desenhar texto nas posições definidas
      if (form.getFields().length === 0) {
        devLog.log("Nenhum campo AcroForm encontrado, usando posições fixas");

        Object.entries(formData).forEach(([key, value]) => {
          const position = SAMPLE_POSITIONS[key];
          if (position && value) {
            page.drawText(value, {
              x: position.x,
              y: position.y,
              size: 10,
              color: rgb(0, 0, 0),
            });
          }
        });
      }

      // Aplicar atualizações do formulário se houver campos AcroForm
      if (form.getFields().length > 0) {
        form.updateFieldAppearances();
      }

      const pdfBytes = await pdfDoc.save();

      // Criar URL para o PDF
      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Limpar URL anterior se existir
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }

      setPdfPreviewUrl(url);
      return url;
    } catch (error) {
      devLog.error("Erro ao gerar preview do PDF:", error);
      return null;
    }
  };

  // Atualizar preview quando os dados do formulário mudarem (com debounce)
  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      if (formData.nome || formData.rg || formData.cpf) {
        generatePdfPreview();
      }
    }, 500);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [formData]);

  // Gerar preview inicial quando o componente montar
  useEffect(() => {
    generatePdfPreview();

    // Cleanup: revogar URL quando o componente desmontar
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, []);

  const handleEditPdf = async () => {
    try {
      setIsEditingPdf(true);

      const url = await generatePdfPreview();
      if (url) {
        // Criar link de download
        const link = document.createElement("a");
        link.href = url;
        link.download = "declaracao-preenchida.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      devLog.log("PDF editado e baixado com sucesso!");
    } catch (error) {
      devLog.error("Erro ao editar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsEditingPdf(false);
    }
  };

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Editor de Declaração PDF
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RG *
            </label>
            <input
              type="text"
              name="rg"
              value={formData.rg}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite seu RG"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CPF *
            </label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Digite seu CPF"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Enviar Formulário
            </button>

            <button
              type="button"
              onClick={handleEditPdf}
              disabled={isEditingPdf || isLoadingPdf}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {isLoadingPdf
                ? "Carregando PDF..."
                : isEditingPdf
                ? "Editando PDF..."
                : "Baixar Declaração"}
            </button>
          </div>
        </form>

        {/* Preview em Tempo Real com Iframe */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preview do PDF em Tempo Real
          </h3>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-600">
            {pdfPreviewUrl ? (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded-md"
                title="Preview do PDF"
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">
                  {isLoadingPdf ? "Carregando PDF..." : "Gerando preview..."}
                </p>
              </div>
            )}
          </div>

          {/* Informações do Formulário */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Dados Preenchidos:
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <div>
                <strong>Nome:</strong> {formData.nome || "[Não preenchido]"}
              </div>
              <div>
                <strong>RG:</strong> {formData.rg || "[Não preenchido]"}
              </div>
              <div>
                <strong>CPF:</strong> {formData.cpf || "[Não preenchido]"}
              </div>
            </div>
          </div>

          {/* Informações do PDF */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
              Informações do PDF:
            </h4>
            <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <div>Template: sample-positions.pdf</div>
              <div>Campos: Nome, RG, CPF</div>
              <div className="mt-2 text-xs">
                {Object.entries(SAMPLE_POSITIONS).map(([key, position]) => (
                  <div key={key}>
                    {key}: x={position.x}, y={position.y}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isSubmitted && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-green-700 dark:text-green-300 font-medium">
                ✓ Formulário enviado com sucesso!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

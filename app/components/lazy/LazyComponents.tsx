import React, { Suspense } from "react";
import Loading from "../ui/Loading";

// Remove a importação lazy do SignatureCanvas
export const LazyPDFDocument = {
  load: async (bytes: Uint8Array) => {
    const { PDFDocument } = await import("pdf-lib");
    return PDFDocument.load(bytes);
  },
  create: async () => {
    const { PDFDocument } = await import("pdf-lib");
    return PDFDocument.create();
  },
};

// Hook para lazy loading condicional (mantemos para outros usos)
export const useLazyImport = <T,>(
  importFn: () => Promise<T>,
  condition = true
) => {
  const [component, setComponent] = React.useState<T | null>(null);

  React.useEffect(() => {
    if (condition && !component) {
      importFn().then(setComponent);
    }
  }, [condition, component, importFn]);

  return component;
};

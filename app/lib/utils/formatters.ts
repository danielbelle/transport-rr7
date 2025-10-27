export const Formatters = {
  fileSize: (bytes: number): string => {
    if (!bytes || isNaN(bytes)) return "(0 MB)";
    return `(${(bytes / 1024 / 1024).toFixed(2)} MB)`;
  },

  currency: (value: number, currency = "BRL"): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  },

  date: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("pt-BR").format(dateObj);
  },

  cpf: (cpf: string): string => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  rg: (rg: string): string => {
    return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
  },
};

export const Logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log("[TAPP]", ...args);
    }
  },

  error: (...args: any[]) => {
    console.error("[TAPP ERROR]", ...args);
  },

  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn("[TAPP WARN]", ...args);
    }
  },

  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info("[TAPP INFO]", ...args);
    }
  },
};

type LogContext = Record<string, unknown>;

export const logger = {
  error(scope: string, error: unknown, context?: LogContext) {
    console.error(`[${scope}]`, error, context ?? "");
  },

  info(scope: string, message: string, context?: LogContext) {
    console.info(`[${scope}] ${message}`, context ?? "");
  },
};

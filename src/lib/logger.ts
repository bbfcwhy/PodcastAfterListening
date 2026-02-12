/**
 * 環境感知的日誌工具
 * 在開發環境中輸出詳細日誌，在生產環境中僅輸出錯誤
 */

interface LoggerConfig {
    isDevelopment: boolean;
    enableDebug: boolean;
}

const config: LoggerConfig = {
    isDevelopment: process.env.NODE_ENV === 'development',
    enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
};

class Logger {
    /**
     * 除錯日誌 - 僅在開發環境或啟用除錯模式時輸出
     */
    debug(...args: unknown[]): void {
        if (config.isDevelopment || config.enableDebug) {
            // eslint-disable-next-line no-console
            console.log('[DEBUG]', ...args);
        }
    }

    /**
     * 資訊日誌 - 僅在開發環境輸出
     */
    info(...args: unknown[]): void {
        if (config.isDevelopment) {
            // eslint-disable-next-line no-console
            console.info('[INFO]', ...args);
        }
    }

    /**
     * 警告日誌 - 在所有環境輸出
     */
    warn(...args: unknown[]): void {
        console.warn('[WARN]', ...args);
    }

    /**
     * 錯誤日誌 - 在所有環境輸出
     * 在生產環境中，可以考慮發送到錯誤追蹤服務（如 Sentry）
     */
    error(...args: unknown[]): void {
        console.error('[ERROR]', ...args);

        // TODO: 在生產環境中發送到錯誤追蹤服務
        // if (!config.isDevelopment) {
        //   sendToErrorTracking(args);
        // }
    }

    /**
     * 帶上下文的錯誤日誌
     */
    errorWithContext(message: string, error: unknown, context?: Record<string, unknown>): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;

        this.error(message, {
            error: errorMessage,
            stack,
            ...context,
        });
    }
}

// 導出單例實例
export const logger = new Logger();

// 便利函式
export const log = {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    errorWithContext: logger.errorWithContext.bind(logger),
};

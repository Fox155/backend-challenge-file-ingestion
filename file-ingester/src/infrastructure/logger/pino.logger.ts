import pino, { Logger } from "pino";
import { ILogger } from "../../application/ports/logger";

export class PinoLogger implements ILogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = pino({
      level: "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty" }
          : undefined,
    });
  }

  info(message: string, context: Record<string, any> = {}): void {
    this.logger.info(context, message);
  }

  warn(message: string, context: Record<string, any> = {}): void {
    this.logger.warn(context, message);
  }

  error(message: string, context: Record<string, any> = {}): void {
    this.logger.error(context, message);
  }

  debug(message: string, context: Record<string, any> = {}): void {
    this.logger.debug(context, message);
  }
}

import express, { Express, Request, Response } from "express";
import { config } from "../../config";
import { ILogger } from "../../application/ports/logger";
import { IPerformanceMonitor } from "../../application/ports/monitor";

export class WebServer {
  private app: Express;

  constructor(
    private readonly logger: ILogger,
    private readonly monitor: IPerformanceMonitor
  ) {
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Endpoint de Health Check.
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "ok", timestamp: new Date() });
    });

    this.app.get("/metrics", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "ok",
        metrics: this.monitor.stats(),
        timestamp: new Date(),
      });
    });
  }

  public start(onStartCallback?: () => void): void {
    const port = config.server.port;
    this.app.listen(port, () => {
      this.logger.info(
        `Servidor HTTP escuchando en el puerto ${config.server.port}`,
        {
          component: "Server",
        }
      );

      if (onStartCallback) {
        onStartCallback();
      }
    });
  }
}

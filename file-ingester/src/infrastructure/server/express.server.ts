import express, { Express, Request, Response } from "express";
import { config } from "../../config";

export class WebServer {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Endpoint de Health Check.
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "ok", timestamp: new Date() });
    });

    this.app.get("/metrics", (_req: Request, res: Response) => {
      const mem = process.memoryUsage();
      const cpu = process.cpuUsage();

      res.json({
        memory: {
          rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
        },
        cpu: {
          user: cpu.user,
          system: cpu.system,
        },
        timestamp: new Date(),
      });
    });
  }

  public start(onStartCallback?: () => void): void {
    const port = config.server.port;
    this.app.listen(port, () => {
      console.log(`[Server] Servidor HTTP escuchando en el puerto ${port}`);
      console.log(
        `[Server] Endpoint de Health disponible en http://localhost:${port}/health`
      );
      if (onStartCallback) {
        onStartCallback();
      }
    });
  }
}

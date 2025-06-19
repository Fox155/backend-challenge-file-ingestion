import {
  createClientFromLine,
  Client,
  ValidationError,
} from "../../domain/client";
import { IClientRepository } from "../ports/client.repository";
import { IFileProvider } from "../ports/file.provider";
import { ILogger } from "../ports/logger";
import { IPerformanceMonitor } from "../ports/monitor";

/**
 * Caso de uso de la aplicación. Orquesta la lectura, validación y guardado.
 */
export class ProcessFileUseCase {
  constructor(
    private readonly fileProvider: IFileProvider,
    private readonly clientRepository: IClientRepository,
    private readonly batchSize: number,
    private readonly logger: ILogger,
    private readonly monitor: IPerformanceMonitor
  ) {}

  async execute(totalLines: number = 0): Promise<void> {
    this.logger.info("Iniciando el procesamiento del archivo...", {
      component: "UseCase",
    });

    this.monitor.start(totalLines);

    let clientBatch: Client[] = [];
    let records = 0;

    try {
      for await (const { line, lineNumber } of this.fileProvider.getLines()) {
        try {
          records++;
          this.monitor.updateProgress(records);

          const client = createClientFromLine(line);

          clientBatch.push(client);

          // Si el lote está lleno, se guarda.
          if (clientBatch.length >= this.batchSize) {
            this.monitor.startDbBatch();
            await this.clientRepository.saveBatch(clientBatch);
            this.monitor.endDbBatch();

            this.logger.info(
              `Lote de ${clientBatch.length} clientes guardado.`,
              { batchSize: clientBatch.length, component: "UseCase" }
            );

            clientBatch = [];
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            this.logger.warn(`Error de validación en línea ${lineNumber}`, {
              line,
              error: error.message,
              component: "UseCase",
            });
          } else {
            this.logger.error(`Error inesperado en línea ${lineNumber}`, {
              line,
              error,
              component: "UseCase",
            });
          }
        }
      }

      // Si no se llego a completar el ultimo lote
      if (clientBatch.length > 0) {
        this.monitor.startDbBatch();
        await this.clientRepository.saveBatch(clientBatch);
        this.monitor.endDbBatch();
        this.logger.info(
          `Lote final de ${clientBatch.length} clientes guardado.`,
          { batchSize: clientBatch.length }
        );
      }
    } catch (error) {
      this.logger.error("Error crítico durante el procesamiento del archivo", {
        error,
      });
    } finally {
      this.monitor.stop();
      this.logger.info("Procesamiento finalizado.");
    }
  }
}

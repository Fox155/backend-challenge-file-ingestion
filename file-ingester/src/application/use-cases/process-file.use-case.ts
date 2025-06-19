import {
  createClientFromLine,
  Client,
  ValidationError,
} from "../../domain/client";
import { IClientRepository } from "../ports/client.repository";
import { IFileProvider } from "../ports/file.provider";

interface ProcessStats {
  totalLines: number;
  successfulRecords: number;
  failedRecords: number;
  totalBatches: number;
  startTime: number;
  endTime: number;
  totalTimeSeconds: number;
}

/**
 * Caso de uso de la aplicación. Orquesta la lectura, validación y guardado.
 */
export class ProcessFileUseCase {
  constructor(
    private readonly fileProvider: IFileProvider,
    private readonly clientRepository: IClientRepository,
    private readonly batchSize: number
  ) {}

  async execute(): Promise<ProcessStats> {
    console.log("[UseCase] Iniciando el procesamiento del archivo...");
    const stats: Omit<ProcessStats, "endTime" | "totalTimeSeconds"> = {
      totalLines: 0,
      successfulRecords: 0,
      failedRecords: 0,
      totalBatches: 0,
      startTime: Date.now(),
    };

    let clientBatch: Client[] = [];

    try {
      for await (const { line, lineNumber } of this.fileProvider.getLines()) {
        stats.totalLines++;
        try {
          const client = createClientFromLine(line);

          clientBatch.push(client);
          stats.successfulRecords++;

          // Si el lote está lleno, se guarda.
          if (clientBatch.length >= this.batchSize) {
            await this.clientRepository.saveBatch(clientBatch);
            stats.totalBatches++;

            clientBatch = [];
          }
        } catch (error) {
          stats.failedRecords++;
          if (error instanceof ValidationError) {
            console.warn(
              `[UseCase] Error de validación en línea ${lineNumber}: ${error.message}. Línea: "${line}"`
            );
          } else {
            console.error(
              `[UseCase] Error inesperado en línea ${lineNumber}:`,
              error
            );
          }
        }
      }

      // Si no se llego a completar el ultimo lote
      if (clientBatch.length > 0) {
        await this.clientRepository.saveBatch(clientBatch);
        stats.totalBatches++;
      }
    } catch (error) {
      console.error(
        "[UseCase] Error crítico durante el procesamiento del archivo:",
        error
      );
    } finally {
      const endTime = Date.now();
      const totalTimeSeconds = (endTime - stats.startTime) / 1000;

      const finalStats: ProcessStats = { ...stats, endTime, totalTimeSeconds };

      console.log("[UseCase] Procesamiento finalizado.");
      console.log("--- Estadísticas Finales ---");
      console.log(`Líneas totales leídas: ${finalStats.totalLines}`);
      console.log(
        `Registros procesados con éxito: ${finalStats.successfulRecords}`
      );
      console.log(`Registros con errores: ${finalStats.failedRecords}`);
      console.log(`Lotes guardados en BD: ${finalStats.totalBatches}`);
      console.log(
        `Tiempo total: ${finalStats.totalTimeSeconds.toFixed(2)} segundos.`
      );
      console.log("--------------------------");

      return finalStats;
    }
  }
}

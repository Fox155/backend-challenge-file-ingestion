import { config } from "./config";
import { ProcessFileUseCase } from "./application/use-cases/process-file.use-case";
import { SqlClientRepository } from "./infrastructure/repository/sql.client";
import { WebServer } from "./infrastructure/server/express.server";
import { LineByLineFileProvider } from "./infrastructure/providers/file";
import { PinoLogger } from "./infrastructure/logger/pino.logger";
import { CliPerformanceMonitor } from "./infrastructure/metrics/monitor";

(async () => {
  let sqlRepository: SqlClientRepository | undefined;
  const logger = new PinoLogger();

  try {
    // Inicializacion de dependencias
    const monitor = new CliPerformanceMonitor();
    sqlRepository = new SqlClientRepository();
    const fileProvider = new LineByLineFileProvider(config.file.path);
    const server = new WebServer(logger, monitor);

    const processFileUseCase = new ProcessFileUseCase(
      fileProvider,
      sqlRepository,
      config.processing.batchSize,
      logger,
      monitor
    );

    let totalLines = 0;
    if (config.metrics.precountLines) {
      totalLines = await fileProvider.countFileLines(config.file.path);
      logger.info(`Total de líneas a procesar: ${totalLines}`);
    }

    // Inicia el procesado del archivo
    const startProcessing = async () => {
      try {
        await processFileUseCase.execute(totalLines);
      } catch (error) {
        logger.error("Ha ocurrido un error fatal durante la ejecución", {
          error,
          component: "Main",
        });
      } finally {
        if (sqlRepository) {
          logger.info("Cerrando la conexión con la base de datos...", {
            component: "Main",
          });
          await sqlRepository.close();
        }
        logger.info(
          "El proceso ha finalizado. El servidor HTTP seguirá activo.",
          {
            component: "Main",
          }
        );
      }
    };

    // Inicia el server web, luego empieza a procesar
    server.start(startProcessing);
  } catch (error) {
    logger.error("Error al inicializar la aplicación", {
      error,
      component: "Main",
    });

    if (sqlRepository) {
      await sqlRepository.close();
      process.exit(1);
    }
  }

  process.on("SIGINT", async () => {
    logger.info("Recibida señal SIGINT. Cerrando conexiones...", {
      component: "Main",
    });
    if (sqlRepository) {
      await sqlRepository.close();
    }
    process.exit(0);
  });
})();

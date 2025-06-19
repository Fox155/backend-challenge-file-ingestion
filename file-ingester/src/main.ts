import { config } from "./config";
import { ProcessFileUseCase } from "./application/use-cases/process-file.use-case";
import { SqlClientRepository } from "./infrastructure/repository/sql.client";
import { WebServer } from "./infrastructure/server/express.server";
import { LineByLineFileProvider } from "./infrastructure/providers/file";

let sqlRepository: SqlClientRepository | undefined;

try {
  // Inicializacion de dependencias
  const server = new WebServer();
  sqlRepository = new SqlClientRepository();
  const fileProvider = new LineByLineFileProvider(config.file.path);

  const processFileUseCase = new ProcessFileUseCase(
    fileProvider,
    sqlRepository,
    config.processing.batchSize
  );

  // Inicia el procesado del archivo
  const startProcessing = async () => {
    try {
      await processFileUseCase.execute();
    } catch (error) {
      console.error("Ha ocurrido un error fatal durante la ejecución:", error);
    } finally {
      if (sqlRepository) {
        console.log("[Main] Cerrando la conexión con la base de datos...");
        await sqlRepository.close();
      }
      console.log(
        "[Main] El proceso ha finalizado. El servidor HTTP seguirá activo."
      );
    }
  };

  // Inicia el server web, luego empieza a procesar
  server.start(startProcessing);
} catch (error) {
  console.error("[Main] Error al inicializar la aplicación:", error);

  if (sqlRepository) {
    sqlRepository.close().then(process.exit(1));
  }
}

process.on("SIGINT", async () => {
  console.log("[Main] Recibida señal SIGINT. Cerrando conexiones...");
  if (sqlRepository) {
    await sqlRepository.close();
  }
  process.exit(0);
});

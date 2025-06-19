import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ],
});

export const config = {
  db: {
    server: process.env.DB_SERVER || "localhost",
    port: parseInt(process.env.DB_PORT || "1433", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "challenge",
  },
  file: {
    path: process.env.FILE_PATH || "challenge/input/CLIENTES_IN_0425.dat",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
  processing: {
    batchSize: parseInt(process.env.BATCH_SIZE || "1000", 10),
  },
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
  metrics: {
    precountLines: (process.env.PRECOUNT_TOTAL_LINES || "false") === "true",
    interval: parseInt(process.env.MONITOR_INTERVAL || "2000", 10),
  },
};

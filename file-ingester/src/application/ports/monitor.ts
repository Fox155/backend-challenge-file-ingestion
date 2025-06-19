import { ProcessStats } from "../../domain/stats";

export interface IPerformanceMonitor {
  start(totalRecords: number): void;
  stop(): void;
  updateProgress(processedRecords: number): void;
  startDbBatch(): void;
  endDbBatch(): void;
  stats(): ProcessStats;
}

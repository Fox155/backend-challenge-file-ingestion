import { IPerformanceMonitor } from "../../application/ports/monitor";
import { config } from "../../config";
import { ProcessStats } from "../../domain/stats";

export class CliPerformanceMonitor implements IPerformanceMonitor {
  private totalRecords = 0;
  private processedRecords = 0;
  private startTime = 0;
  private lastDbBatchStartTime = 0;
  private totalDbTime = 0;
  private dbBatchCount = 0;
  private timer: NodeJS.Timeout | null = null;

  start(totalRecords: number): void {
    this.totalRecords = totalRecords;
    this.startTime = Date.now();

    this.timer = setInterval(() => this.display(), config.metrics.interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.display();
    process.stdout.write("\n");
  }

  updateProgress(processedRecords: number): void {
    this.processedRecords = processedRecords;
  }

  startDbBatch(): void {
    this.lastDbBatchStartTime = Date.now();
  }

  endDbBatch(): void {
    const duration = Date.now() - this.lastDbBatchStartTime;
    this.totalDbTime += duration;
    this.dbBatchCount++;
  }

  stats(): ProcessStats {
    return this.getStats();
  }

  private display(): void {
    const stats = this.getStats();
    const progressBar = this.getProgressBar(stats.records.percentage);

    const output = `Progreso: ${progressBar} ${stats.records.percentage}% | ${this.processedRecords}/${this.totalRecords} | RPS: ${stats.rps} | DB avg: ${stats.db.avgTime}ms | Heap: ${stats.memory.heapUsed}MB`;

    process.stdout.write("\r" + output);
  }

  private getStats(): ProcessStats {
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    const percentage =
      this.totalRecords > 0
        ? (this.processedRecords / this.totalRecords) * 100
        : 0;
    const rps =
      elapsedTime > 0 ? +(this.processedRecords / elapsedTime).toFixed(2) : 0;
    const avgDbTime =
      this.dbBatchCount > 0
        ? +(this.totalDbTime / this.dbBatchCount).toFixed(0)
        : 0;

    return {
      rps: rps,
      db: {
        avgTime: avgDbTime,
      },
      records: {
        percentage: +percentage.toFixed(2),
        processed: this.processedRecords,
        total: this.totalRecords,
      },
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system,
      },
    };
  }

  private getProgressBar(percentage: number): string {
    const width = 20;
    const completedWidth = Math.round((width * percentage) / 100);
    const remainingWidth = width - completedWidth;
    return `[${"=".repeat(completedWidth)}${">".repeat(
      remainingWidth > 0 ? 1 : 0
    )}${".".repeat(remainingWidth > 0 ? remainingWidth - 1 : 0)}]`;
  }
}

export interface ProcessStats {
  rps: number;
  db: {
    avgTime: number;
  };
  records: {
    percentage: number;
    processed: number;
    total: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
}

export interface IFileProvider {
  /**
   * Devuelve un generador que emite cada línea del archivo
   * junto con su número de línea.
   */
  getLines(): AsyncGenerator<{ line: string; lineNumber: number }>;
}

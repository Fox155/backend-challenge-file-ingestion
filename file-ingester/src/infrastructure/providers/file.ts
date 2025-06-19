import fs from "fs";
import readline from "readline";
import { IFileProvider } from "../../application/ports/file.provider";

export class LineByLineFileProvider implements IFileProvider {
  constructor(private readonly filePath: string) {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${this.filePath}`);
    }
  }

  /**
   * Devuelve un generador que emite cada línea del archivo
   * junto con su número de línea.
   */
  async *getLines(): AsyncGenerator<{ line: string; lineNumber: number }> {
    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Para los saltos de línea (\n o \r\n)
    });

    let lineNumber = 0;
    for await (const line of rl) {
      lineNumber++;

      if (line.trim() !== "") {
        yield { line, lineNumber };
      }
    }
  }

  async countFileLines(filePath: string): Promise<number> {
    let lineCount = 0;
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    for await (const _ of rl) {
      lineCount++;
    }

    return lineCount;
  }
}

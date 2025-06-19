import sql, { ConnectionPool, Table } from "mssql";
import { Client } from "../../domain/client";
import { config } from "../../config";

export class SqlClientRepository {
  private pool: ConnectionPool;

  constructor() {
    this.pool = new ConnectionPool({
      server: config.db.server,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      options: {
        trustServerCertificate: true,
      },
    });
  }

  private async connect(): Promise<void> {
    if (!this.pool.connected) {
      await this.pool.connect();
    }
  }

  /**
   * Guarda un lote de clientes
   * @param clients - Un array de entidades Client.
   */
  async saveBatch(clients: Client[]): Promise<void> {
    if (clients.length === 0) {
      return;
    }

    await this.connect();

    const table = new Table("Clientes");
    table.create = false;

    table.columns.add("NombreCompleto", sql.NVarChar(100), { nullable: false });
    table.columns.add("DNI", sql.BigInt, { nullable: false });
    table.columns.add("Estado", sql.VarChar(10), { nullable: false });
    table.columns.add("FechaIngreso", sql.Date, { nullable: false });
    table.columns.add("EsPEP", sql.Bit, { nullable: false });
    table.columns.add("EsSujetoObligado", sql.Bit, { nullable: true });
    table.columns.add("FechaCreacion", sql.DateTime, { nullable: false });

    const now = new Date();
    for (const client of clients) {
      table.rows.add(
        client.fullName,
        client.dni,
        client.status,
        client.entryDate,
        client.isPEP,
        client.isObligatedSubject,
        now
      );
    }

    // Ejecutar la operación bulk
    const request = this.pool.request();
    await request.bulk(table);
    console.log(
      `[DB] Lote de ${clients.length} clientes insertado correctamente.`
    );
  }

  async close(): Promise<void> {
    if (this.pool.connected) {
      await this.pool.close();
    }
  }
}

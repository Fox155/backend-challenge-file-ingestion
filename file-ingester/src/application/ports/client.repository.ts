import { Client } from "../../domain/client";

export interface IClientRepository {
  /**
   * Guarda un lote (batch) de clientes
   * @param clients - Un array de entidades Client.
   */
  saveBatch(clients: Client[]): Promise<void>;
}

import pgp from "pg-promise";
import { DatabaseConfig } from "./DatabaseConfig";

export default interface DatabaseConnection {
  query<T>(statement: string, params: unknown[]): Promise<T[]>;
  close(): Promise<void>;
}

export class PgPromiseAdapter implements DatabaseConnection {
  private connection;

  constructor(config: DatabaseConfig) {
    this.connection = pgp()(config);
  }

  query<T>(statement: string, params: unknown[]): Promise<T[]> {
    return this.connection.query<T[]>(statement, params);
  }

  close(): Promise<void> {
    return this.connection.$pool.end();
  }
}

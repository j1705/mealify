import { buildApp } from "./app";
import { Environment } from "./infra/config/environment";
import { DatabaseConfig, readDatabaseConfig } from "./infra/database/DatabaseConfig";
import DatabaseConnection, { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import { RunningServer } from "./infra/http/HttpServer";
import { readServerConfig } from "./infra/http/ServerConfig";

type ConnectToDatabase = (config: DatabaseConfig) => DatabaseConnection;

const connectToPostgres: ConnectToDatabase = (config) => new PgPromiseAdapter(config);

export async function startServer(
  env: Environment,
  connectToDatabase: ConnectToDatabase = connectToPostgres,
): Promise<RunningServer> {
  const { port, corsOrigin } = readServerConfig(env);
  const connection = connectToDatabase(readDatabaseConfig(env));
  try {
    const server = await buildApp(connection, corsOrigin).listen(port);
    return {
      port: server.port,
      close: async () => {
        await server.close();
        await connection.close();
      },
    };
  } catch (error) {
    await connection.close();
    throw error;
  }
}

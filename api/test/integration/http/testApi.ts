import { buildApp } from "../../../src/app";
import { readDatabaseConfig } from "../../../src/infra/database/DatabaseConfig";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../../src/infra/database/DatabaseConnection";
import { RunningServer } from "../../../src/infra/http/HttpServer";

export type ApiResponse = {
  status: number;
  headers: Headers;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export async function startTestApi() {
  const connection: DatabaseConnection = new PgPromiseAdapter(readDatabaseConfig());
  const server: RunningServer = await buildApp(connection).listen(0);
  const baseUrl = `http://localhost:${server.port}`;
  const itemIds: number[] = [];
  const mealIds: number[] = [];

  async function send(method: string, path: string, init: RequestInit = {}): Promise<ApiResponse> {
    const response = await fetch(baseUrl + path, { method, ...init });
    const text = await response.text();
    const isJson = response.headers.get("content-type")?.includes("application/json");
    return {
      status: response.status,
      headers: response.headers,
      body: isJson ? JSON.parse(text) : text,
    };
  }

  return {
    connection,
    send,
    request: (method: string, path: string, body?: unknown) =>
      send(method, path, {
        headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    trackItem: (id: number) => itemIds.push(id),
    trackMeal: (id: number) => mealIds.push(id),
    async stop() {
      await connection.query(`delete from meals where id = any($1)`, [mealIds]);
      await connection.query(`delete from items where id = any($1)`, [itemIds]);
      await server.close();
      await connection.close();
    },
  };
}

export type TestApi = Awaited<ReturnType<typeof startTestApi>>;

export const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

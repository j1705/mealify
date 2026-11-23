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
  const userIds: number[] = [];

  let defaultSessionCookie = "";

  async function send(method: string, path: string, init: RequestInit = {}): Promise<ApiResponse> {
    const headers = new Headers(init.headers);
    if (!headers.has("Cookie")) headers.set("Cookie", defaultSessionCookie);
    const response = await fetch(baseUrl + path, { method, ...init, headers });
    const text = await response.text();
    const isJson = response.headers.get("content-type")?.includes("application/json");
    return {
      status: response.status,
      headers: response.headers,
      body: isJson ? JSON.parse(text) : text,
    };
  }

  const request = (method: string, path: string, body?: unknown, cookie?: string) =>
    send(method, path, {
      headers: {
        "Content-Type": "application/json",
        ...(cookie === undefined ? {} : { Cookie: cookie }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  async function registerUser(): Promise<{ userId: number; cookie: string }> {
    const response = await request(
      "POST",
      "/auth/register",
      { email: uniqueEmail(), password: TEST_PASSWORD },
      NO_SESSION,
    );
    userIds.push(response.body.userId);
    return { userId: response.body.userId, cookie: sessionCookieOf(response)! };
  }

  defaultSessionCookie = (await registerUser()).cookie;

  return {
    connection,
    send,
    request,
    registerUser,
    trackItem: (id: number) => itemIds.push(id),
    trackMeal: (id: number) => mealIds.push(id),
    trackUser: (id: number) => userIds.push(id),
    async stop() {
      await connection.query(`delete from users where id = any($1)`, [userIds]);
      await connection.query(`delete from meals where id = any($1)`, [mealIds]);
      await connection.query(`delete from items where id = any($1)`, [itemIds]);
      await server.close();
      await connection.close();
    },
  };
}

export type TestApi = Awaited<ReturnType<typeof startTestApi>>;

export const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const uniqueEmail = () => `user-${uniqueSuffix()}@example.com`;

export const NO_SESSION = "";

const TEST_PASSWORD = "correct horse battery";

export function sessionCookieOf(response: ApiResponse): string | undefined {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0]!)
    .find((pair) => pair.startsWith("mealify_session="));
}

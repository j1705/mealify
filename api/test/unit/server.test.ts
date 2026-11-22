import { createServer, Server } from "node:net";
import { AddressInfo } from "node:net";
import DatabaseConnection from "../../src/infra/database/DatabaseConnection";
import { startServer } from "../../src/server";

const databaseEnv = {
  DB_HOST: "db.local",
  DB_PORT: "5432",
  DB_NAME: "mealify",
  DB_USER: "meal",
  DB_PASSWORD: "secret",
};

function fakeConnection(): DatabaseConnection & { close: jest.Mock } {
  return { query: jest.fn(), close: jest.fn().mockResolvedValue(undefined) };
}

async function occupyFreePort(): Promise<{ port: number; blocker: Server }> {
  const blocker = createServer();
  await new Promise<void>((resolve) => blocker.listen(0, resolve));
  return { port: (blocker.address() as AddressInfo).port, blocker };
}

async function release(blocker: Server) {
  await new Promise<void>((resolve) => blocker.close(() => resolve()));
}

describe("startServer", () => {
  test("Should report a missing database setting as a rejection, not a synchronous throw", async () => {
    const started = startServer({});

    await expect(started).rejects.toThrow("Missing environment variable: DB_HOST");
  });

  test("Should close the database connection when the server closes", async () => {
    const { port, blocker } = await occupyFreePort();
    await release(blocker);
    const connection = fakeConnection();

    const server = await startServer({ ...databaseEnv, PORT: String(port) }, () => connection);
    await server.close();

    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("Should close the database connection when the port is already taken", async () => {
    const { port, blocker } = await occupyFreePort();
    const connection = fakeConnection();

    try {
      await expect(
        startServer({ ...databaseEnv, PORT: String(port) }, () => connection),
      ).rejects.toThrow(/EADDRINUSE/);
      expect(connection.close).toHaveBeenCalledTimes(1);
    } finally {
      await release(blocker);
    }
  });
});

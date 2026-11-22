import { ValidationError } from "../../../src/domain/error/DomainError";
import { ExpressAdapter, RunningServer } from "../../../src/infra/http/HttpServer";
import { startTestApi, TestApi } from "./testApi";

describe("HTTP server behaviour on the real app", () => {
  let api: TestApi;

  beforeAll(async () => {
    api = await startTestApi();
  });

  afterAll(async () => {
    await api.stop();
  });

  test("Malformed JSON answers 400 in JSON, without leaking the stack trace", async () => {
    const response = await api.send("POST", "/items", {
      headers: { "Content-Type": "application/json" },
      body: '{"name": ',
    });
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.body).toEqual({ message: "Invalid JSON body" });
  });

  test("Malformed JSON answer carries the CORS header so the front can read it", async () => {
    const response = await api.send("POST", "/items", {
      headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
      body: '{"name": ',
    });
    expect(response.status).toBe(400);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
  });

  test("Unknown route answers 404 in JSON", async () => {
    const response = await api.request("GET", "/nothing");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Route not found" });
  });

  test("Unsupported method on a known path answers 404 in JSON", async () => {
    const response = await api.request("PATCH", "/items/1", {});
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Route not found" });
  });

  test("CORS preflight answers 204 for the front origin", async () => {
    const response = await api.send("OPTIONS", "/items", {
      headers: { Origin: "http://localhost:5173", "Access-Control-Request-Method": "POST" },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    expect(response.headers.get("access-control-allow-methods")).toContain("DELETE");
  });

  test("Regular responses carry the CORS header too", async () => {
    const response = await api.request("GET", "/items?limit=1");
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
  });
});

describe("ExpressAdapter error mapping", () => {
  let server: RunningServer;
  let consoleError: jest.SpyInstance;
  const get = (path: string) => fetch(`http://localhost:${server.port}${path}`);

  beforeAll(async () => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const adapter = new ExpressAdapter();
    adapter.register("get", "/domain-error", async () => {
      throw new ValidationError("Bad value");
    });
    adapter.register("get", "/unexpected-error", async () => {
      throw new Error("database is down at /home/someone/secret.ts");
    });
    adapter.register("post", "/created", async () => ({ ok: true }), 201);
    adapter.register("get", "/echo-query", async (_params, _body, query) => query);
    server = await adapter.listen(0);
  });

  afterAll(async () => {
    await server.close();
    consoleError.mockRestore();
  });

  test("A known error answers its mapped status code and message", async () => {
    const response = await get("/domain-error");
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ message: "Bad value" });
  });

  test("Unexpected error answers 500 with a generic message and logs the error", async () => {
    const response = await get("/unexpected-error");
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: "Internal server error" });
    expect(consoleError).toHaveBeenCalled();
  });

  test("Single query parameters reach the route", async () => {
    const response = await get("/echo-query?limit=10&search=arroz");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ limit: "10", search: "arroz" });
  });

  test("A repeated query parameter answers 400 instead of being dropped", async () => {
    const response = await get("/echo-query?limit=500&limit=10");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Repeated query parameter: limit" });
  });

  test("Routes answer the status code they were registered with", async () => {
    const response = await fetch(`http://localhost:${server.port}/created`, { method: "POST" });
    expect(response.status).toBe(201);
  });
});

describe("ExpressAdapter lifecycle", () => {
  test("Should refuse to register a route after listen instead of hiding it behind the 404", async () => {
    const adapter = new ExpressAdapter();
    const server = await adapter.listen(0);
    try {
      expect(() => adapter.register("get", "/late", async () => ({}))).toThrow(
        "Routes must be registered before listen",
      );
    } finally {
      await server.close();
    }
  });
});

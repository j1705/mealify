import { afterEach, describe, expect, test, vi } from "vitest";
import { API_URL } from "../../src/config";
import { ApiError, request } from "../../src/services/http";

function stubFetch(status: number, body?: unknown) {
  const response = new Response(body === undefined ? null : JSON.stringify(body), { status });
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("fetches the path under the API url and returns the parsed body", async () => {
    const fetchMock = stubFetch(200, { id: 1 });

    const data = await request<{ id: number }>("/items/1", "Falhou");

    expect(data).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items/1`, expect.anything());
  });

  test("sends a JSON body with its content type", async () => {
    const fetchMock = stubFetch(201, { itemId: 1 });

    await request("/items", "Falhou", { method: "POST", body: { name: "Rice" } });

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items`, {
      method: "POST",
      body: JSON.stringify({ name: "Rice" }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  });

  test("sends the session cookie to the API on every request", async () => {
    const fetchMock = stubFetch(200, {});

    await request("/items", "Falhou");

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: "include" });
  });

  test("rejects with an ApiError carrying the response status", async () => {
    stubFetch(401, { message: "Authentication required" });

    const error = await request("/auth/me", "Falhou").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
  });

  test("forwards the abort signal", async () => {
    const fetchMock = stubFetch(200, {});
    const controller = new AbortController();

    await request("/items", "Falhou", { signal: controller.signal });

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ signal: controller.signal });
  });

  test("accepts an answer without a body", async () => {
    stubFetch(204);

    await expect(request("/items/1", "Falhou", { method: "DELETE" })).resolves.toBeNull();
  });

  test("translates a known API error message", async () => {
    stubFetch(409, { message: "Item is used in a meal" });

    await expect(request("/items/1", "Não foi possível excluir o item")).rejects.toThrow(
      "Este item está em uso em uma refeição e não pode ser excluído.",
    );
  });

  test("falls back to the given message for an unknown API error", async () => {
    stubFetch(500, { message: "Internal server error" });

    await expect(request("/items", "Não foi possível carregar os itens")).rejects.toThrow(
      "Não foi possível carregar os itens",
    );
  });

  test("reports a connection failure in Portuguese instead of the browser message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(request("/items", "Não foi possível carregar os itens")).rejects.toThrow(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    );
  });

  test("keeps the abort error when the request is cancelled", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));
    controller.abort();

    await expect(request("/items", "Falhou", { signal: controller.signal })).rejects.toBe(
      abortError,
    );
  });

  test("falls back to the given message when the error has no body", async () => {
    stubFetch(502);

    await expect(request("/items", "Não foi possível carregar os itens")).rejects.toThrow(
      "Não foi possível carregar os itens",
    );
  });
});

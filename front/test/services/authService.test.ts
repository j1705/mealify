import { afterEach, describe, expect, test, vi } from "vitest";
import { API_URL } from "../../src/config";
import { getCurrentUser, login, logout, registerUser } from "../../src/services/authService";

function stubFetch(status: number, body?: unknown) {
  const response = new Response(body === undefined ? null : JSON.stringify(body), { status });
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const credentials = { email: "ana@example.com", password: "correct horse" };
const ana = { userId: 1, email: "ana@example.com" };

describe("authService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("registers with the credentials and returns the new user", async () => {
    const fetchMock = stubFetch(201, ana);

    await expect(registerUser(credentials)).resolves.toEqual(ana);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/register`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(credentials) }),
    );
  });

  test("explains in Portuguese why the registration failed", async () => {
    stubFetch(409, { message: "Email already registered" });

    await expect(registerUser(credentials)).rejects.toThrow("Já existe uma conta com esse e-mail.");
  });

  test("logs in with the credentials and returns the user", async () => {
    const fetchMock = stubFetch(200, ana);

    await expect(login(credentials)).resolves.toEqual(ana);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(credentials) }),
    );
  });

  test("explains in Portuguese why the login failed", async () => {
    stubFetch(401, { message: "Invalid email or password" });

    await expect(login(credentials)).rejects.toThrow("E-mail ou senha incorretos.");
  });

  test("logs out", async () => {
    const fetchMock = stubFetch(204);

    await logout();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/logout`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("returns the user of the current session", async () => {
    const fetchMock = stubFetch(200, ana);

    await expect(getCurrentUser()).resolves.toEqual(ana);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/auth/me`);
  });

  test("returns null when there is no session", async () => {
    stubFetch(401, { message: "Authentication required" });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  test("keeps other failures as errors", async () => {
    stubFetch(500, { message: "Internal server error" });

    await expect(getCurrentUser()).rejects.toThrow("Não foi possível verificar a sessão");
  });
});

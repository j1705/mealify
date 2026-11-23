import { ApiResponse, sessionCookieOf, startTestApi, TestApi, uniqueEmail } from "./testApi";

const PASSWORD = "correct horse battery";
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

describe("Auth API", () => {
  let api: TestApi;

  beforeAll(async () => {
    api = await startTestApi();
  });

  afterAll(async () => {
    await api.stop();
  });

  async function register(email = uniqueEmail(), password = PASSWORD) {
    const response = await api.request("POST", "/auth/register", { email, password });
    if (response.status === 201) api.trackUser(response.body.userId);
    return response;
  }

  const withCookie = (cookie: string | undefined) => ({ headers: { Cookie: cookie ?? "" } });
  const me = (cookie: string | undefined) => api.send("GET", "/auth/me", withCookie(cookie));
  const logout = (cookie?: string) => api.send("POST", "/auth/logout", withCookie(cookie));
  const login = (email: string, password: string) =>
    api.request("POST", "/auth/login", { email, password });

  function setCookieHeader(response: ApiResponse) {
    return response.headers.getSetCookie().find((cookie) => cookie.startsWith("mealify_session="));
  }

  describe("POST /auth/register", () => {
    test("Should register the user with the normalized email, without exposing the token", async () => {
      const email = uniqueEmail();

      const response = await register(` ${email.toUpperCase()} `);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ userId: expect.any(Number), email });
    });

    test("Should open a session through an HttpOnly, SameSite=Lax cookie lasting thirty days", async () => {
      const response = await register();

      const cookie = setCookieHeader(response) ?? "";
      expect(cookie).toMatch(/^mealify_session=[A-Za-z0-9_-]{43}; /);
      expect(cookie).toContain(`Max-Age=${THIRTY_DAYS_IN_SECONDS}`);
      expect(cookie).toContain("Path=/");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Lax");
      expect(cookie).not.toContain("Secure");
    });

    test("Should refuse an email already registered, in any case", async () => {
      const email = uniqueEmail();
      await register(email);

      const response = await register(email.toUpperCase());

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Email already registered" });
      expect(setCookieHeader(response)).toBeUndefined();
    });

    test.each([
      [{ email: "ana", password: PASSWORD }, "Invalid email."],
      [
        { email: "ana@example.com", password: "short" },
        "Password must be at least 8 characters long.",
      ],
      [{}, "Email is required."],
      [[], "Email is required."],
    ])("Should answer 422 for invalid credentials: %p", async (body, message) => {
      const response = await api.request("POST", "/auth/register", body);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({ message });
    });

    test("Should answer 422 when there is no body", async () => {
      const response = await api.send("POST", "/auth/register");

      expect(response.status).toBe(422);
      expect(response.body).toEqual({ message: "Email is required." });
    });
  });

  describe("GET /auth/me", () => {
    test("Should answer the user of the session", async () => {
      const registered = await register();

      const response = await me(sessionCookieOf(registered));

      expect(response.status).toBe(200);
      expect(response.body).toEqual(registered.body);
    });

    test.each([
      ["no cookie", undefined],
      ["an unknown token", "mealify_session=unknown"],
      ["an empty token", "mealify_session="],
    ])("Should answer 401 with %s", async (_case, cookie) => {
      const response = await me(cookie);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required" });
    });
  });

  describe("POST /auth/logout", () => {
    test("Should end the session and clear the cookie", async () => {
      const cookie = sessionCookieOf(await register());

      const response = await logout(cookie);

      expect(response.status).toBe(204);
      expect(setCookieHeader(response)).toMatch(/^mealify_session=; .*Max-Age=0/);
      expect((await me(cookie)).status).toBe(401);
    });

    test("Should keep the other sessions of the user", async () => {
      const email = uniqueEmail();
      const first = sessionCookieOf(await register(email));
      const second = sessionCookieOf(await login(email, PASSWORD));

      await logout(first);

      expect((await me(second)).status).toBe(200);
    });

    test("Should answer 204 and clear the cookie even without a session", async () => {
      const response = await logout();

      expect(response.status).toBe(204);
      expect(setCookieHeader(response)).toMatch(/^mealify_session=; /);
    });
  });

  describe("POST /auth/login", () => {
    test("Should log in and open a new session", async () => {
      const email = uniqueEmail();
      const registered = await register(email);

      const response = await login(email.toUpperCase(), PASSWORD);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(registered.body);
      const cookie = sessionCookieOf(response);
      expect(cookie).not.toBe(sessionCookieOf(registered));
      expect((await me(cookie)).body).toEqual(registered.body);
    });

    test.each([
      ["a wrong password", "wrong horse battery"],
      ["a password in another case", PASSWORD.toUpperCase()],
    ])("Should answer 401 for %s, without a cookie", async (_case, password) => {
      const email = uniqueEmail();
      await register(email);

      const response = await login(email, password);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid email or password" });
      expect(setCookieHeader(response)).toBeUndefined();
    });

    test("Should answer the same 401 for an unknown email", async () => {
      const response = await login(uniqueEmail(), PASSWORD);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid email or password" });
    });
  });
});

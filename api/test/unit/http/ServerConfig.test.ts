import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_PORT,
  readServerConfig,
} from "../../../src/infra/http/ServerConfig";

describe("readServerConfig", () => {
  test("Should read the port and the allowed origin", () => {
    expect(readServerConfig({ PORT: "4000", CORS_ORIGIN: "http://front.local" })).toEqual({
      port: 4000,
      corsOrigin: "http://front.local",
      secureCookies: false,
    });
  });

  test.each([{}, { PORT: "", CORS_ORIGIN: "", COOKIE_SECURE: "" }])(
    "Should fall back to the defaults when the settings are missing or empty: %p",
    (env) => {
      expect(readServerConfig(env)).toEqual({
        port: DEFAULT_PORT,
        corsOrigin: DEFAULT_CORS_ORIGIN,
        secureCookies: false,
      });
    },
  );

  test.each(["abc", "0", "-1", "65536", "1e3", " 3000"])(
    "Should throw when PORT is not a valid port: %p",
    (port) => {
      expect(() => readServerConfig({ PORT: port })).toThrow("Invalid environment variable: PORT");
    },
  );

  test.each([
    ["true", true],
    ["false", false],
  ])("Should read COOKIE_SECURE=%p as %p", (value, secureCookies) => {
    expect(readServerConfig({ COOKIE_SECURE: value }).secureCookies).toBe(secureCookies);
  });

  test.each(["yes", "1", "TRUE", " true"])(
    "Should throw when COOKIE_SECURE is not true or false: %p",
    (value) => {
      expect(() => readServerConfig({ COOKIE_SECURE: value })).toThrow(
        "Invalid environment variable: COOKIE_SECURE",
      );
    },
  );
});

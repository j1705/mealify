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
    });
  });

  test.each([{}, { PORT: "", CORS_ORIGIN: "" }])(
    "Should fall back to the defaults when the settings are missing or empty: %p",
    (env) => {
      expect(readServerConfig(env)).toEqual({
        port: DEFAULT_PORT,
        corsOrigin: DEFAULT_CORS_ORIGIN,
      });
    },
  );

  test.each(["abc", "0", "-1", "65536", "1e3", " 3000"])(
    "Should throw when PORT is not a valid port: %p",
    (port) => {
      expect(() => readServerConfig({ PORT: port })).toThrow("Invalid environment variable: PORT");
    },
  );
});

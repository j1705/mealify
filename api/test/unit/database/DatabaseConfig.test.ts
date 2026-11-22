import { readDatabaseConfig } from "../../../src/infra/database/DatabaseConfig";

const completeEnv = {
  DB_HOST: "db.local",
  DB_PORT: "6543",
  DB_NAME: "mealify",
  DB_USER: "meal",
  DB_PASSWORD: "secret",
};

describe("readDatabaseConfig", () => {
  test("Should read the connection settings from the given environment", () => {
    expect(readDatabaseConfig(completeEnv)).toEqual({
      host: "db.local",
      port: 6543,
      database: "mealify",
      user: "meal",
      password: "secret",
    });
  });

  test.each(Object.keys(completeEnv))("Should throw when %s is missing", (name) => {
    const env = { ...completeEnv, [name]: undefined };

    expect(() => readDatabaseConfig(env)).toThrow(`Missing environment variable: ${name}`);
  });

  test.each(["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"])(
    "Should throw when %s is empty",
    (name) => {
      expect(() => readDatabaseConfig({ ...completeEnv, [name]: "" })).toThrow(
        `Missing environment variable: ${name}`,
      );
    },
  );

  test("Should accept an empty password for servers that do not require one", () => {
    expect(readDatabaseConfig({ ...completeEnv, DB_PASSWORD: "" }).password).toBe("");
  });

  test.each(["abc", "0", "-1", "65536", "1e3", "5432.5", " 5432"])(
    "Should throw when DB_PORT is not a valid port: %p",
    (port) => {
      expect(() => readDatabaseConfig({ ...completeEnv, DB_PORT: port })).toThrow(
        "Invalid environment variable: DB_PORT",
      );
    },
  );

  test.each([
    ["1", 1],
    ["65535", 65535],
  ])("Should accept the port %p", (port, expected) => {
    expect(readDatabaseConfig({ ...completeEnv, DB_PORT: port }).port).toBe(expected);
  });
});

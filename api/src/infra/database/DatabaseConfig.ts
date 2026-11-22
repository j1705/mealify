import { Environment, requireDefined, requireNonEmpty, requirePort } from "../config/environment";

export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export function readDatabaseConfig(env: Environment = process.env): DatabaseConfig {
  return {
    host: requireNonEmpty(env, "DB_HOST"),
    port: requirePort(env, "DB_PORT"),
    database: requireNonEmpty(env, "DB_NAME"),
    user: requireNonEmpty(env, "DB_USER"),
    password: requireDefined(env, "DB_PASSWORD"),
  };
}

import { Environment, optionalBoolean, optionalPort, optionalText } from "../config/environment";

export const DEFAULT_PORT = 3000;
export const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

export type ServerConfig = {
  port: number;
  corsOrigin: string;
  secureCookies: boolean;
};

export function readServerConfig(env: Environment): ServerConfig {
  return {
    port: optionalPort(env, "PORT", DEFAULT_PORT),
    corsOrigin: optionalText(env, "CORS_ORIGIN", DEFAULT_CORS_ORIGIN),
    secureCookies: optionalBoolean(env, "COOKIE_SECURE", false),
  };
}

export type Environment = Record<string, string | undefined>;

const DECIMAL_DIGITS = /^\d+$/;
const MIN_PORT = 1;
const MAX_PORT = 65535;

export function requireDefined(env: Environment, name: string): string {
  const value = env[name];
  if (value === undefined) throw missing(name);
  return value;
}

export function requireNonEmpty(env: Environment, name: string): string {
  const value = requireDefined(env, name);
  if (value === "") throw missing(name);
  return value;
}

export function requirePort(env: Environment, name: string): number {
  return parsePort(requireNonEmpty(env, name), name);
}

export function optionalPort(env: Environment, name: string, defaultPort: number): number {
  const value = env[name];
  return value ? parsePort(value, name) : defaultPort;
}

export function optionalText(env: Environment, name: string, defaultValue: string): string {
  return env[name] || defaultValue;
}

function parsePort(value: string, name: string): number {
  const port = Number(value);
  if (!DECIMAL_DIGITS.test(value) || port < MIN_PORT || port > MAX_PORT)
    throw new Error(`Invalid environment variable: ${name}`);
  return port;
}

function missing(name: string) {
  return new Error(`Missing environment variable: ${name}`);
}

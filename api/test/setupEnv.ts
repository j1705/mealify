import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

if (existsSync(".env.test")) {
  for (const [key, value] of Object.entries(parseEnv(readFileSync(".env.test", "utf8")))) {
    process.env[key] ??= value;
  }
}

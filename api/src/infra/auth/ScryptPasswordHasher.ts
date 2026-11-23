import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import PasswordHasher from "../../application/auth/PasswordHasher";

const deriveKey = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const ALGORITHM = "scrypt";
const SEPARATOR = "$";
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const ENCODING = "base64url";

export default class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const key = await deriveKey(password, salt, KEY_BYTES);
    return [ALGORITHM, salt.toString(ENCODING), key.toString(ENCODING)].join(SEPARATOR);
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    const stored = parse(passwordHash);
    if (!stored) return false;
    const key = await deriveKey(password, stored.salt, KEY_BYTES);
    return timingSafeEqual(key, stored.key);
  }
}

function parse(passwordHash: string): { salt: Buffer; key: Buffer } | null {
  const [algorithm, salt, key, ...rest] = passwordHash.split(SEPARATOR);
  if (algorithm !== ALGORITHM || !salt || !key || rest.length > 0) return null;
  const keyBytes = Buffer.from(key, ENCODING);
  if (keyBytes.length !== KEY_BYTES) return null;
  return { salt: Buffer.from(salt, ENCODING), key: keyBytes };
}

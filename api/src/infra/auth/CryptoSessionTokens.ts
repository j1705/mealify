import { createHash, randomBytes } from "node:crypto";
import SessionTokens from "../../application/auth/SessionTokens";

const TOKEN_BYTES = 32;

export default class CryptoSessionTokens implements SessionTokens {
  generate(): string {
    return randomBytes(TOKEN_BYTES).toString("base64url");
  }

  digest(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

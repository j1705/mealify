const PAIR_SEPARATOR = ";";
const NAME_VALUE_SEPARATOR = "=";

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies = new Map<string, string>();
  for (const pair of (header ?? "").split(PAIR_SEPARATOR)) {
    const separatorAt = pair.indexOf(NAME_VALUE_SEPARATOR);
    if (separatorAt === -1) continue;
    const name = pair.slice(0, separatorAt).trim();
    if (!name || cookies.has(name)) continue;
    cookies.set(name, decode(pair.slice(separatorAt + 1).trim()));
  }
  return Object.fromEntries(cookies);
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

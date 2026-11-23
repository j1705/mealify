const HOME = "/";
const AUTH_PATHS = ["/login", "/register"];

export function safeRedirectPath(path: string | null): string {
  if (!path || !isAppPath(path) || isAuthPath(path)) return HOME;
  return path;
}

function isAppPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");
}

function isAuthPath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0];
  return AUTH_PATHS.includes(pathname ?? "");
}

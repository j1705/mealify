import { API_URL } from "../config";
import { translateApiMessage } from "./apiErrorMessages";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type UnauthorizedListener = () => void;

const UNAUTHORIZED = 401;
const AUTH_ROUTES_PREFIX = "/auth/";
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function isSessionLost(path: string, status: number): boolean {
  return status === UNAUTHORIZED && !path.startsWith(AUTH_ROUTES_PREFIX);
}

const CONNECTION_FAILED =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

export async function request<T>(
  path: string,
  fallbackMessage: string,
  { body, ...options }: RequestOptions = {},
): Promise<T> {
  const response = await send(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    ...(body === undefined
      ? {}
      : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (isSessionLost(path, response.status))
      unauthorizedListeners.forEach((listener) => listener());
    throw new ApiError(translateApiMessage(data?.message, fallbackMessage), response.status);
  }
  return data as T;
}

async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error(CONNECTION_FAILED, { cause: error });
  }
}

import { API_URL } from "../config";
import { translateApiMessage } from "./apiErrorMessages";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

const CONNECTION_FAILED =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

export async function request<T>(
  path: string,
  fallbackMessage: string,
  { body, ...options }: RequestOptions = {},
): Promise<T> {
  const response = await send(`${API_URL}${path}`, {
    ...options,
    ...(body === undefined
      ? {}
      : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(translateApiMessage(data?.message, fallbackMessage));
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

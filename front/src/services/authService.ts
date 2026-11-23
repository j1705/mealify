import type { Credentials, User } from "../types/User";
import { ApiError, request } from "./http";

const UNAUTHORIZED = 401;

export function registerUser(credentials: Credentials): Promise<User> {
  return request<User>("/auth/register", "Não foi possível criar a conta", {
    method: "POST",
    body: credentials,
  });
}

export function login(credentials: Credentials): Promise<User> {
  return request<User>("/auth/login", "Não foi possível entrar", {
    method: "POST",
    body: credentials,
  });
}

export async function logout(): Promise<void> {
  await request("/auth/logout", "Não foi possível sair", { method: "POST" });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<User | null> {
  try {
    return await request<User>("/auth/me", "Não foi possível verificar a sessão", { signal });
  } catch (error) {
    if (error instanceof ApiError && error.status === UNAUTHORIZED) return null;
    throw error;
  }
}

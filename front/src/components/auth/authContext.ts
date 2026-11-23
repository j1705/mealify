import { createContext, useContext } from "react";
import type { Credentials, User } from "../../types/User";

export type AuthStatus = "loading" | "anonymous" | "authenticated";

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

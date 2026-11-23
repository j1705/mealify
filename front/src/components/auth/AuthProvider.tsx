import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authService from "../../services/authService";
import type { Credentials, User } from "../../types/User";
import { AuthContext, type AuthStatus } from "./authContext";

type Session = { status: AuthStatus; user: User | null };

const LOADING: Session = { status: "loading", user: null };
const ANONYMOUS: Session = { status: "anonymous", user: null };
const authenticated = (user: User): Session => ({ status: "authenticated", user });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(LOADING);

  useEffect(() => {
    const controller = new AbortController();
    const settleInitialCheck = (next: Session) => {
      if (controller.signal.aborted) return;
      setSession((current) => (current.status === "loading" ? next : current));
    };
    authService.getCurrentUser(controller.signal).then(
      (user) => settleInitialCheck(user ? authenticated(user) : ANONYMOUS),
      () => settleInitialCheck(ANONYMOUS),
    );
    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    setSession(authenticated(await authService.login(credentials)));
  }, []);

  const register = useCallback(async (credentials: Credentials) => {
    setSession(authenticated(await authService.registerUser(credentials)));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(ANONYMOUS);
  }, []);

  const value = useMemo(
    () => ({ ...session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authService from "../../services/authService";
import { onUnauthorized } from "../../services/http";
import type { Credentials, User } from "../../types/User";
import { AuthContext, type AuthStatus } from "./authContext";

type Session = { status: AuthStatus; user: User | null; loggedOut: boolean };

const LOADING: Session = { status: "loading", user: null, loggedOut: false };
const ANONYMOUS: Session = { status: "anonymous", user: null, loggedOut: false };
const LOGGED_OUT: Session = { ...ANONYMOUS, loggedOut: true };
const authenticated = (user: User): Session => ({
  status: "authenticated",
  user,
  loggedOut: false,
});

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

  useEffect(() => onUnauthorized(() => setSession(ANONYMOUS)), []);

  const login = useCallback(async (credentials: Credentials) => {
    setSession(authenticated(await authService.login(credentials)));
  }, []);

  const register = useCallback(async (credentials: Credentials) => {
    setSession(authenticated(await authService.registerUser(credentials)));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(LOGGED_OUT);
  }, []);

  const value = useMemo(
    () => ({ ...session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

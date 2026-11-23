import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";
import styles from "./RequireAuth.module.css";

export default function RequireAuth() {
  const { status, loggedOut } = useAuth();
  const { pathname, search } = useLocation();

  if (status === "loading") {
    return (
      <p className={styles.checking} role="status">
        Verificando sua sessão...
      </p>
    );
  }

  if (status === "anonymous") {
    if (loggedOut) return <Navigate to="/login" replace />;
    const next = new URLSearchParams({ next: pathname + search });
    return <Navigate to={`/login?${next}`} replace />;
  }

  return <Outlet />;
}

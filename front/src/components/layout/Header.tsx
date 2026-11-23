import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { useAuth } from "../auth/authContext";
import Button from "../ui/Button";
import { MenuIcon, UserIcon, UtensilsSmallIcon } from "../ui/icons";
import { useToast } from "../ui/toastContext";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <MenuIcon size={22} />
        </button>
        <Link to="/" className={styles.brand}>
          <span className={styles.logoMark}>
            <UtensilsSmallIcon size={18} />
          </span>
          <span className={styles.brandName}>Mealify</span>
        </Link>
      </div>

      <AccountArea />
    </header>
  );
}

function AccountArea() {
  const auth = useAuth();
  const { showToast } = useToast();

  async function handleLogout() {
    try {
      await auth.logout();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Não foi possível sair", "error");
    }
  }

  if (auth.status === "anonymous") {
    return (
      <Button to="/login" variant="secondary" size="sm">
        Entrar
      </Button>
    );
  }

  if (!auth.user) return null;

  return (
    <div className={styles.user}>
      <span className={styles.userName}>{auth.user.email}</span>
      <span className={styles.avatar}>
        <UserIcon size={18} />
      </span>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  );
}

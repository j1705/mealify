import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { MenuIcon, UserIcon, UtensilsSmallIcon } from "../ui/icons";

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

      <div className={styles.user}>
        <span className={styles.userName}>Minha conta</span>
        <span className={styles.avatar}>
          <UserIcon size={18} />
        </span>
      </div>
    </header>
  );
}

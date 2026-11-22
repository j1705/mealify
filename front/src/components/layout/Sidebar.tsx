import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { HomeIcon, MealsIcon, ItemsIcon, SettingsIcon, CloseIcon } from "../ui/icons";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { to: "/", label: "Início", icon: HomeIcon, end: true },
  { to: "/meals", label: "Refeições", icon: MealsIcon, end: false },
  { to: "/items", label: "Itens", icon: ItemsIcon, end: false },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" data-sidebar-overlay />
      )}
      <aside className={[styles.sidebar, open ? styles.sidebarOpen : ""].join(" ")}>
        <div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <CloseIcon size={20} />
          </button>
          <nav className={styles.nav}>
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                onClick={onClose}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ""].join(" ")
                }
              >
                <Icon size={18} />
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <span className={styles.navLinkDisabled} title="Ainda não disponível">
          <span className={styles.disabledLabel}>
            <SettingsIcon size={18} />
            <span className={styles.navLabel}>Configurações</span>
          </span>
          <span className={[styles.soonBadge, styles.navLabel].join(" ")}>em breve</span>
        </span>
      </aside>
    </>
  );
}

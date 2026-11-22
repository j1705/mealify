import { useEffect, useId, useRef, type MouseEvent, type SyntheticEvent } from "react";
import styles from "./ConfirmDialog.module.css";
import Button from "./Button";
import { TrashIcon } from "./icons";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const INITIAL_FOCUS = "[data-initial-focus]";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>(INITIAL_FOCUS)?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function cancelUnlessDeleting() {
    if (!loading) onCancel();
  }

  function handleEscape(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    cancelUnlessDeleting();
  }

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    const clickedOutsideTheBox = event.target === event.currentTarget;
    if (clickedOutsideTheBox) cancelUnlessDeleting();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleEscape}
      onClick={handleClick}
    >
      <div className={styles.box}>
        <span className={styles.iconWrap} aria-hidden="true">
          <TrashIcon size={20} />
        </span>
        <div>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading} data-initial-focus>
            {cancelLabel}
          </Button>
          <Button variant="dangerSolid" onClick={onConfirm} disabled={loading}>
            {loading ? "Excluindo..." : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

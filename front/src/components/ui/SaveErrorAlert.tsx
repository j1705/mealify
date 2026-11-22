import Alert from "./Alert";
import styles from "./SaveErrorAlert.module.css";

export default function SaveErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className={styles.spaced}>
      <Alert variant="error" title="Não foi possível salvar">
        {error}
      </Alert>
    </div>
  );
}

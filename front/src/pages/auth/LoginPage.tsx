import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import styles from "../../components/auth/AuthLayout.module.css";
import { useAuth } from "../../components/auth/authContext";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Input from "../../components/ui/Input";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { useAuthSubmit } from "../../hooks/useAuthSubmit";
import { useFormValidation, type FieldErrors } from "../../hooks/useFormValidation";

type LoginFormValues = { email: string; password: string };

const EMPTY_VALUES: LoginFormValues = { email: "", password: "" };

function validate(values: LoginFormValues): FieldErrors<LoginFormValues> {
  const errors: FieldErrors<LoginFormValues> = {};
  if (!values.email.trim()) errors.email = "Informe o e-mail.";
  if (!values.password) errors.password = "Informe a senha.";
  return errors;
}

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { redirectTo, keepingNext } = useAuthRedirect();
  const [values, setValues] = useState(EMPTY_VALUES);
  const { submitting, error, submit } = useAuthSubmit(
    () => auth.login({ email: values.email.trim(), password: values.password }),
    () => navigate(redirectTo, { replace: true }),
  );
  const { errors, update, handleSubmit } = useFormValidation({
    values,
    onChange: setValues,
    validate,
    onSubmit: submit,
  });

  if (auth.status === "authenticated") return <Navigate to={redirectTo} replace />;

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para registrar suas refeições."
      errorTitle="Não foi possível entrar"
      error={error}
      footer={
        <>
          Ainda não tem conta? <Link to={keepingNext("/register")}>Criar conta</Link>
        </>
      }
    >
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <Field label="E-mail" htmlFor="login-email" required error={errors.email}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            invalid={!!errors.email}
          />
        </Field>

        <Field label="Senha" htmlFor="login-password" required error={errors.password}>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            invalid={!!errors.password}
          />
        </Field>

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}

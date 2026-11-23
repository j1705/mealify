import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import styles from "../../components/auth/AuthLayout.module.css";
import { useAuth } from "../../components/auth/authContext";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/toastContext";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { useAuthSubmit } from "../../hooks/useAuthSubmit";
import { useFormValidation, type FieldErrors } from "../../hooks/useFormValidation";
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateNewPassword,
} from "../../utils/validation";

type RegisterFormValues = { email: string; password: string; confirmation: string };

const EMPTY_VALUES: RegisterFormValues = { email: "", password: "", confirmation: "" };

function validate(values: RegisterFormValues): FieldErrors<RegisterFormValues> {
  const errors: FieldErrors<RegisterFormValues> = {};
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  const passwordError = validateNewPassword(values.password);
  if (passwordError) errors.password = passwordError;
  if (values.confirmation !== values.password) errors.confirmation = "As senhas não conferem.";
  return errors;
}

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { redirectTo, keepingNext } = useAuthRedirect();
  const [values, setValues] = useState(EMPTY_VALUES);
  const { submitting, error, submit } = useAuthSubmit(
    () => auth.register({ email: values.email.trim(), password: values.password }),
    () => {
      showToast("Conta criada com sucesso!");
      navigate(redirectTo, { replace: true });
    },
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
      title="Criar conta"
      subtitle="Comece a registrar suas refeições e acompanhar seus macronutrientes."
      errorTitle="Não foi possível criar a conta"
      error={error}
      footer={
        <>
          Já tem conta? <Link to={keepingNext("/login")}>Entrar</Link>
        </>
      }
    >
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <Field label="E-mail" htmlFor="register-email" required error={errors.email}>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            maxLength={EMAIL_MAX_LENGTH}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            invalid={!!errors.email}
          />
        </Field>

        <Field
          label="Senha"
          htmlFor="register-password"
          required
          hint={`De ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres`}
          error={errors.password}
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            invalid={!!errors.password}
          />
        </Field>

        <Field
          label="Confirmar senha"
          htmlFor="register-confirmation"
          required
          error={errors.confirmation}
        >
          <Input
            id="register-confirmation"
            type="password"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            value={values.confirmation}
            onChange={(e) => update("confirmation", e.target.value)}
            invalid={!!errors.confirmation}
          />
        </Field>

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthLayout>
  );
}

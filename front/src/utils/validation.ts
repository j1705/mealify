export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 50;
export const MAX_SEARCH_LENGTH = NAME_MAX_LENGTH;
export const DESCRIPTION_MIN_LENGTH = 3;
export const DESCRIPTION_MAX_LENGTH = 500;

export function validateName(name: string): string | undefined {
  const length = name.trim().length;
  if (length < NAME_MIN_LENGTH) return `Informe pelo menos ${NAME_MIN_LENGTH} caracteres.`;
  if (length > NAME_MAX_LENGTH) return `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`;
  return undefined;
}

export function validateDescription(description: string): string | undefined {
  const length = description.trim().length;
  if (length === 0) return undefined;
  if (length < DESCRIPTION_MIN_LENGTH)
    return `A descrição deve ter pelo menos ${DESCRIPTION_MIN_LENGTH} caracteres.`;
  if (length > DESCRIPTION_MAX_LENGTH)
    return `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  return undefined;
}

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (trimmed.length === 0) return "Informe o e-mail.";
  if (!EMAIL_FORMAT.test(trimmed)) return "Informe um e-mail válido.";
  if (trimmed.length > EMAIL_MAX_LENGTH)
    return `O e-mail deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres.`;
  return undefined;
}

export function validateNewPassword(password: string): string | undefined {
  if (password.length === 0) return "Informe a senha.";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (password.length > PASSWORD_MAX_LENGTH)
    return `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  return undefined;
}

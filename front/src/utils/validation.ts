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

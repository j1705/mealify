import { useState, type FormEvent } from "react";

export type FieldErrors<V> = Partial<Record<keyof V, string>>;

type FormValidationOptions<V> = {
  values: V;
  onChange: (values: V) => void;
  validate: (values: V) => FieldErrors<V>;
  onSubmit: () => void;
};

export function useFormValidation<V>({
  values,
  onChange,
  validate,
  onSubmit,
}: FormValidationOptions<V>) {
  const [errors, setErrors] = useState<FieldErrors<V>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof V>(field: K, value: V[K]) {
    const next = { ...values, [field]: value };
    onChange(next);
    if (submitted) setErrors(validate(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length === 0) onSubmit();
  }

  return { errors, submitted, update, handleSubmit };
}

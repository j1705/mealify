import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { describe, expect, test, vi } from "vitest";
import { useFormValidation } from "../../src/hooks/useFormValidation";

type Values = { name: string; quantity: number };

const validate = (values: Values) => ({
  ...(values.name ? {} : { name: "Informe o nome." }),
  ...(values.quantity > 0 ? {} : { quantity: "Informe a quantidade." }),
});

function submitEvent() {
  return { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
}

function setup(values: Values) {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const hook = renderHook(
    ({ current }) => useFormValidation({ values: current, onChange, validate, onSubmit }),
    { initialProps: { current: values } },
  );
  return { ...hook, onChange, onSubmit };
}

describe("useFormValidation", () => {
  test("shows no errors before the first submit, even for invalid values", () => {
    const { result, onChange } = setup({ name: "", quantity: 0 });

    act(() => result.current.update("name", ""));

    expect(result.current.errors).toEqual({});
    expect(result.current.submitted).toBe(false);
    expect(onChange).toHaveBeenCalledWith({ name: "", quantity: 0 });
  });

  test("blocks an invalid submit and shows every error", () => {
    const { result, onSubmit } = setup({ name: "", quantity: 0 });
    const event = submitEvent();

    act(() => result.current.handleSubmit(event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.submitted).toBe(true);
    expect(result.current.errors).toEqual({
      name: "Informe o nome.",
      quantity: "Informe a quantidade.",
    });
  });

  test("revalidates each change after a failed submit", () => {
    const { result, onChange } = setup({ name: "", quantity: 0 });
    act(() => result.current.handleSubmit(submitEvent()));

    act(() => result.current.update("quantity", 2));

    expect(onChange).toHaveBeenCalledWith({ name: "", quantity: 2 });
    expect(result.current.errors).toEqual({ name: "Informe o nome." });
  });

  test("submits valid values", () => {
    const { result, onSubmit } = setup({ name: "Lunch", quantity: 1 });

    act(() => result.current.handleSubmit(submitEvent()));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.errors).toEqual({});
  });
});

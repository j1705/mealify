import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { decimalInputProps } from "../../src/components/ui/decimalInputProps";

function renderDecimalInput(value: string) {
  const onValueChange = vi.fn();
  render(<input aria-label="Peso" {...decimalInputProps(value, onValueChange)} />);
  return { box: screen.getByRole("textbox", { name: "Peso" }), onValueChange };
}

describe("decimalInputProps", () => {
  test("renders a text box that opens the decimal keyboard", () => {
    const { box } = renderDecimalInput("12,5");

    expect(box).toHaveAttribute("type", "text");
    expect(box).toHaveAttribute("inputmode", "decimal");
    expect(box).toHaveValue("12,5");
  });

  test.each(["1", "12,", "12.5"])("forwards the valid draft %p", (text) => {
    const { box, onValueChange } = renderDecimalInput("");

    fireEvent.change(box, { target: { value: text } });

    expect(onValueChange).toHaveBeenCalledWith(text);
  });

  test.each(["1e5", "-1", "1,555", "abc"])("ignores the keystroke that makes %p", (text) => {
    const { box, onValueChange } = renderDecimalInput("");

    fireEvent.change(box, { target: { value: text } });

    expect(onValueChange).not.toHaveBeenCalled();
  });
});

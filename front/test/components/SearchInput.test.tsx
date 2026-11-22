import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import SearchInput from "../../src/components/ui/SearchInput";

describe("SearchInput", () => {
  test("is a text box with a decorative search icon", () => {
    const { container } = render(
      <SearchInput value="" onChange={() => {}} placeholder="Buscar item..." maxLength={50} />,
    );

    const box = screen.getByPlaceholderText("Buscar item...");
    expect(box).toHaveAttribute("maxlength", "50");
    expect(container.querySelector("svg")?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  test("forwards typing and focus events", () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    render(<SearchInput value="" onChange={onChange} onFocus={onFocus} placeholder="Buscar" />);
    const box = screen.getByPlaceholderText("Buscar");

    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: "rice" } });

    expect(onFocus).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });
});

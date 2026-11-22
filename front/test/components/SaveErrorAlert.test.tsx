import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import SaveErrorAlert from "../../src/components/ui/SaveErrorAlert";

describe("SaveErrorAlert", () => {
  test("renders nothing without an error", () => {
    const { container } = render(<SaveErrorAlert error={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("explains that saving failed and why", () => {
    render(<SaveErrorAlert error="Já existe um item com esse nome." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível salvar");
    expect(alert).toHaveTextContent("Já existe um item com esse nome.");
  });
});

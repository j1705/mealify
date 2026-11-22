import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Sidebar from "../../src/components/layout/Sidebar";

function renderSidebar(open: boolean) {
  const onClose = vi.fn();
  const view = render(
    <MemoryRouter>
      <Sidebar open={open} onClose={onClose} />
    </MemoryRouter>,
  );
  return { ...view, onClose };
}

describe("Sidebar", () => {
  test("closes with Escape while open", () => {
    const { onClose } = renderSidebar(true);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("ignores Escape while closed", () => {
    const { onClose } = renderSidebar(false);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  test("hides the click-to-close overlay from assistive technology", () => {
    const { container, onClose } = renderSidebar(true);
    const overlay = container.querySelector("[data-sidebar-overlay]");

    expect(overlay).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });
});

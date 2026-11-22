import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ConfirmDialog from "../../src/components/ui/ConfirmDialog";

function renderDialog(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = render(
    <ConfirmDialog
      open
      title='Excluir "Lunch"?'
      description="Essa ação não pode ser desfeita."
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { ...view, onConfirm, onCancel };
}

function pressEscape(dialog: HTMLElement) {
  const cancel = createEvent("cancel", dialog, { cancelable: true });
  fireEvent(dialog, cancel);
  return cancel;
}

describe("ConfirmDialog", () => {
  test("opens as a modal alert dialog named and described by its texts", () => {
    renderDialog();

    const dialog = screen.getByRole("alertdialog", { name: 'Excluir "Lunch"?' });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("Essa ação não pode ser desfeita.");
  });

  test("starts with the focus on the safe choice", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  test("closes when it is no longer open", () => {
    const { rerender, onConfirm, onCancel } = renderDialog();

    rerender(<ConfirmDialog open={false} title="x" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("cancels on Escape, leaving the closing to the caller", () => {
    const { onCancel } = renderDialog();

    const event = pressEscape(screen.getByRole("alertdialog"));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  test("ignores Escape while deleting", () => {
    const { onCancel } = renderDialog({ loading: true });

    pressEscape(screen.getByRole("alertdialog"));

    expect(onCancel).not.toHaveBeenCalled();
  });

  test("cancels on a click outside the box", () => {
    const { onCancel } = renderDialog();

    fireEvent.click(screen.getByRole("alertdialog"));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("keeps open on a click inside the box", () => {
    const { onCancel } = renderDialog();

    fireEvent.click(screen.getByText("Essa ação não pode ser desfeita."));

    expect(onCancel).not.toHaveBeenCalled();
  });

  test("confirms", () => {
    const { onConfirm } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

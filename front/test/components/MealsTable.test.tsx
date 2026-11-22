import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import MealsTable from "../../src/components/meals/MealsTable";
import type { Meal } from "../../src/types/Meal";

const lunch: Meal = {
  id: 7,
  name: "Lunch",
  description: null,
  date: "2026-11-21",
  createdAt: "2026-11-21T12:00:00Z",
  calories: 450,
  macronutrients: { protein: 30, carbohydrate: 40, fat: 10 },
  items: [],
};

function renderTable(onDelete = vi.fn()) {
  render(
    <MemoryRouter>
      <MealsTable meals={[lunch]} onDelete={onDelete} />
    </MemoryRouter>,
  );
  return onDelete;
}

describe("MealsTable", () => {
  test("links the meal name to its details", () => {
    renderTable();

    expect(screen.getByRole("link", { name: "Lunch" })).toHaveAttribute("href", "/meals/7");
  });

  test("links to the edit page", () => {
    renderTable();

    expect(screen.getByRole("link", { name: "Editar Lunch" })).toHaveAttribute(
      "href",
      "/meals/7/edit",
    );
  });

  test("asks to delete the meal", () => {
    const onDelete = renderTable();

    fireEvent.click(screen.getByRole("button", { name: "Excluir Lunch" }));

    expect(onDelete).toHaveBeenCalledWith(lunch);
  });
});

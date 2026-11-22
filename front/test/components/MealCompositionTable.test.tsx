import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import MealCompositionTable from "../../src/components/meals/MealCompositionTable";
import type { MealItem } from "../../src/types/Meal";

const bread: MealItem = {
  itemId: 3,
  quantity: 100,
  name: "Pão francês",
  unit: "g",
  calories: 300,
  macronutrients: { protein: 8, carbohydrate: 58.6, fat: 3.1 },
};

describe("MealCompositionTable", () => {
  test("shows each item with its quantity, calories and macronutrients", () => {
    render(<MealCompositionTable items={[bread]} />);

    const row = screen.getByRole("row", { name: /Pão francês/ });
    expect(within(row).getByText("100 g")).toBeInTheDocument();
    expect(within(row).getByText("300 kcal")).toBeInTheDocument();
    expect(within(row).getByText("8g / 58.6g / 3.1g")).toBeInTheDocument();
  });

  test("labels every cell with its column, so a row can be read on its own as a card", () => {
    render(<MealCompositionTable items={[bread]} />);

    const headers = screen.getAllByRole("columnheader").map((th) => th.textContent);
    const row = screen.getByRole("row", { name: /Pão francês/ });
    const labels = within(row)
      .getAllByRole("cell")
      .map((td) => td.getAttribute("data-label"));

    expect(labels).toEqual(headers);
  });
});

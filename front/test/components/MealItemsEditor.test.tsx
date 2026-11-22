import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import MealItemsEditor from "../../src/components/meals/MealItemsEditor";
import { listItems } from "../../src/services/itemService";
import type { Item } from "../../src/types/Item";

vi.mock("../../src/services/itemService");

const rice: Item = {
  id: 3,
  name: "Rice",
  unit: "g",
  calories: 128,
  macronutrients: { protein: 2.5, carbohydrate: 28.1, fat: 0.2 },
};

function renderEditor() {
  render(
    <MealItemsEditor
      itemsById={new Map([[rice.id, rice]])}
      missingIds={new Set()}
      onItemPicked={vi.fn()}
      value={[{ itemId: rice.id, quantity: "100" }]}
      onChange={vi.fn()}
    />,
  );
}

describe("MealItemsEditor", () => {
  beforeEach(() => {
    vi.mocked(listItems).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
    });
  });

  test("labels every data cell with its column, so a row can be read on its own as a card", () => {
    renderEditor();

    const headers = screen
      .getAllByRole("columnheader")
      .map((th) => th.textContent)
      .filter(Boolean);
    const row = screen.getByRole("row", { name: /Rice/ });
    const labels = within(row)
      .getAllByRole("cell")
      .map((td) => td.getAttribute("data-label"))
      .filter(Boolean);

    expect(labels).toEqual(headers);
  });
});

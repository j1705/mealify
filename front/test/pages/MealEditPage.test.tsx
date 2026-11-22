import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ToastProvider } from "../../src/components/ui/ToastProvider";
import MealEditPage from "../../src/pages/meals/MealEditPage";
import { getMeal, updateMeal } from "../../src/services/mealService";
import { getItem, listItems } from "../../src/services/itemService";
import type { Meal } from "../../src/types/Meal";

vi.mock("../../src/services/mealService");
vi.mock("../../src/services/itemService");

const macros = { protein: 2.5, carbohydrate: 28.1, fat: 0.2 };

const dinner: Meal = {
  id: 7,
  name: "Dinner",
  description: "Light dinner after training",
  date: "2026-11-21",
  createdAt: "2026-11-21T20:00:00.000Z",
  calories: 128,
  macronutrients: macros,
  items: [
    { itemId: 3, quantity: 100, name: "Rice", unit: "g", calories: 128, macronutrients: macros },
  ],
};

function renderEditPage() {
  render(
    <MemoryRouter initialEntries={["/meals/7/edit"]}>
      <ToastProvider>
        <Routes>
          <Route path="/meals/:mealId/edit" element={<MealEditPage />} />
          <Route path="/meals" element={<p>Meals list</p>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("MealEditPage", () => {
  beforeEach(() => {
    vi.mocked(getMeal).mockResolvedValue(dinner);
    vi.mocked(getItem).mockResolvedValue({
      id: 3,
      name: "Rice",
      unit: "g",
      calories: 128,
      macronutrients: macros,
    });
    vi.mocked(listItems).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
    });
    vi.mocked(updateMeal).mockResolvedValue();
  });

  test("keeps the meal description when saving other changes", async () => {
    renderEditPage();

    const name = await screen.findByLabelText(/Nome da refeição/);
    expect(screen.getByLabelText(/Descrição/)).toHaveValue(dinner.description);
    fireEvent.change(name, { target: { value: "Supper" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(screen.getByText("Meals list")).toBeInTheDocument());
    expect(updateMeal).toHaveBeenCalledWith(7, {
      name: "Supper",
      description: dinner.description,
      date: dinner.date,
      items: [{ itemId: 3, quantity: 100 }],
    });
  });

  test("shows the saved quantity and saves one typed with a comma", async () => {
    renderEditPage();

    const quantity = await screen.findByRole("textbox", { name: "Quantidade de Rice" });
    expect(quantity).toHaveValue("100");
    fireEvent.change(quantity, { target: { value: "150,5" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(screen.getByText("Meals list")).toBeInTheDocument());
    expect(updateMeal).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        items: [{ itemId: 3, quantity: 150.5 }],
      }),
    );
  });

  test("ignores keystrokes beyond 2 decimal places in the quantity", async () => {
    renderEditPage();

    const quantity = await screen.findByRole("textbox", { name: "Quantidade de Rice" });
    fireEvent.change(quantity, { target: { value: "1.25" } });
    fireEvent.change(quantity, { target: { value: "1.255" } });

    expect(quantity).toHaveValue("1.25");
  });

  test.each(["", "12,"])("refuses to save the unfinished quantity %p", async (text) => {
    renderEditPage();

    const quantity = await screen.findByRole("textbox", { name: "Quantidade de Rice" });
    fireEvent.change(quantity, { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("A quantidade de cada item deve ser maior que 0."),
    ).toBeInTheDocument();
    expect(quantity).toHaveAttribute("aria-invalid", "true");
    expect(updateMeal).not.toHaveBeenCalled();
  });
});

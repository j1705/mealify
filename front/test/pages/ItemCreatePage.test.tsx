import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ItemCreatePage from "../../src/pages/items/ItemCreatePage";
import { createItem } from "../../src/services/itemService";
import { renderWithProviders } from "../renderWithProviders";

vi.mock("../../src/services/itemService");

const NUTRIENT_LABELS = [/Calorias/, /Proteínas/, /Carboidratos/, /Gorduras/];

function fillNutrients(calories: string, protein: string, carbohydrate: string, fat: string) {
  [calories, protein, carbohydrate, fat].forEach((value, index) => {
    fireEvent.change(screen.getByLabelText(NUTRIENT_LABELS[index]), { target: { value } });
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Criar" }));
}

describe("ItemCreatePage", () => {
  beforeEach(() => {
    vi.mocked(createItem).mockResolvedValue();
  });

  test("starts with an empty name, grams and every nutrient empty", () => {
    renderWithProviders(<ItemCreatePage />);

    expect(screen.getByLabelText(/Nome/)).toHaveValue("");
    expect(screen.getByLabelText(/Unidade/)).toHaveValue("g");
    NUTRIENT_LABELS.forEach((label) => expect(screen.getByLabelText(label)).toHaveValue(""));
  });

  test("ignores keystrokes that would not make a number with up to 2 decimal places", () => {
    renderWithProviders(<ItemCreatePage />);
    const calories = screen.getByLabelText(/Calorias/);

    fireEvent.change(calories, { target: { value: "1e5" } });
    expect(calories).toHaveValue("");

    fireEvent.change(calories, { target: { value: "3,66" } });
    fireEvent.change(calories, { target: { value: "3,666" } });
    expect(calories).toHaveValue("3,66");
  });

  test("asks for every empty nutrient instead of saving zeros", () => {
    renderWithProviders(<ItemCreatePage />);
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: "Rice" } });

    submit();

    expect(screen.getAllByText("Informe um valor.")).toHaveLength(4);
    expect(createItem).not.toHaveBeenCalled();
  });

  test("refuses a number left unfinished after the separator", () => {
    renderWithProviders(<ItemCreatePage />);
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: "Rice" } });
    fillNutrients("130", "2,", "28", "0");

    submit();

    expect(screen.getByText("Informe um número com até 2 casas decimais.")).toBeInTheDocument();
    expect(createItem).not.toHaveBeenCalled();
  });

  test("saves nutrients typed with comma or dot as numbers", async () => {
    renderWithProviders(<ItemCreatePage />);
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: "Rice" } });
    fillNutrients("130", "2,5", "28.15", "0");

    submit();

    await waitFor(() =>
      expect(createItem).toHaveBeenCalledWith({
        name: "Rice",
        unit: "g",
        calories: 130,
        protein: 2.5,
        carbohydrate: 28.15,
        fat: 0,
      }),
    );
  });
});

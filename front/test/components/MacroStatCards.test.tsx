import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import MacroStatCards from "../../src/components/meals/MacroStatCards";

const totals = { calories: 452.6, protein: 30.25, carbohydrate: 40, fat: 9.94 };

describe("MacroStatCards", () => {
  test("shows the calories and each macronutrient with its unit", () => {
    render(<MacroStatCards totals={totals} caloriesLabel="Calorias totais" />);

    expect(screen.getByText("Calorias totais").parentElement).toHaveTextContent("453kcal");
    expect(screen.getByText("Proteínas").parentElement).toHaveTextContent("30.3g");
    expect(screen.getByText("Carboidratos").parentElement).toHaveTextContent("40g");
    expect(screen.getByText("Gorduras").parentElement).toHaveTextContent("9.9g");
  });

  test("shows an optional hint under the calories", () => {
    render(
      <MacroStatCards
        totals={totals}
        caloriesLabel="Total de calorias"
        caloriesHint="Nenhuma refeição hoje"
      />,
    );

    expect(screen.getByText("Nenhuma refeição hoje")).toBeInTheDocument();
  });
});

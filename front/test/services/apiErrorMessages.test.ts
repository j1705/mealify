import { describe, expect, test } from "vitest";
import { translateApiMessage } from "../../src/services/apiErrorMessages";

describe("translateApiMessage", () => {
  test.each([
    ["Item already registered", "Já existe um item com esse nome."],
    ["Item is used in a meal", "Este item está em uso em uma refeição e não pode ser excluído."],
    ["Item not found", "Item não encontrado."],
    ["Meal not found", "Refeição não encontrada."],
    ["Meal must have at least one item", "A refeição precisa ter pelo menos um item."],
    ["Invalid quantity", "A quantidade de cada item deve ser maior que 0."],
    ["Invalid date", "Data inválida."],
    ["Invalid Unit", "Unidade inválida."],
    ["Invalid Calories", "Calorias inválidas."],
    ["Invalid Protein", "Proteínas inválidas."],
    ["Invalid Carbohydrate", "Carboidratos inválidos."],
    ["Invalid Fat", "Gorduras inválidas."],
    ["Name is required.", "O nome é obrigatório."],
    ["Name must be at least 3 characters long.", "O nome deve ter pelo menos 3 caracteres."],
    ["Name must not exceed 50 characters.", "O nome deve ter no máximo 50 caracteres."],
    [
      "Description must be at least 3 characters long.",
      "A descrição deve ter pelo menos 3 caracteres.",
    ],
    [
      "Description must not exceed 500 characters.",
      "A descrição deve ter no máximo 500 caracteres.",
    ],
  ])("translates %p", (apiMessage, translated) => {
    expect(translateApiMessage(apiMessage, "Falhou")).toBe(translated);
  });

  test.each([
    ["Internal server error"],
    ["Routes must be registered before listen"],
    ["constructor"],
    [undefined],
    [42],
  ])("uses the fallback for %p", (apiMessage) => {
    expect(translateApiMessage(apiMessage, "Falhou")).toBe("Falhou");
  });
});

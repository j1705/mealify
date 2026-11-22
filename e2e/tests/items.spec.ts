import { expect, test } from "./fixtures";

test.describe("Items", () => {
  test("creates an item through the form and finds it with an accent-insensitive search", async ({ page, data }) => {
    const name = `Crème brûlée ${data.suffix}`;

    await page.goto("/items/new");
    await page.fill("#item-name", name);
    await page.fill("#item-calories", "363");
    await page.fill("#item-protein", "5,1");
    await page.fill("#item-carbohydrate", "34.2");
    await page.fill("#item-fat", "24.6");
    await page.getByRole("button", { name: "Criar" }).click();

    await expect(page.getByText("Item criado com sucesso!")).toBeVisible();
    await expect(page).toHaveURL(/\/items$/);

    await page.getByPlaceholder("Buscar item...").fill(`creme brulee ${data.suffix}`);
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(name);
    await expect(rows.first()).toContainText("363");

    const saved = await data.findItemByName(name);
    expect(saved).toMatchObject({ calories: 363 });
  });

  test("edits an item, starting from its saved macronutrients", async ({ page, data }) => {
    const name = `Brown rice ${data.suffix}`;
    await data.createItem({ name, unit: "g", calories: 124, protein: 2.6, carbohydrate: 25.8, fat: 1 });

    await page.goto("/items");
    await page.getByPlaceholder("Buscar item...").fill(name);
    const row = page.locator("tbody tr");
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("2.6g");
    await expect(row).toContainText("25.8g");
    await page.getByRole("link", { name: `Editar ${name}` }).click();

    await expect(page.locator("#item-calories")).toHaveValue("124");
    await expect(page.locator("#item-protein")).toHaveValue("2.6");
    await expect(page.locator("#item-carbohydrate")).toHaveValue("25.8");
    await expect(page.locator("#item-fat")).toHaveValue("1");

    await page.fill("#item-protein", "3.1");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Item atualizado com sucesso!")).toBeVisible();
    await page.getByPlaceholder("Buscar item...").fill(name);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText("3.1g");
    await expect(row).toContainText("25.8g");
  });

  test("cancels a deletion with Escape, returning the focus to the delete button", async ({ page, data }) => {
    const name = `Oat ${data.suffix}`;
    await data.createItem({ name, unit: "g", calories: 389, protein: 16.9, carbohydrate: 66.3, fat: 6.9 });

    await page.goto("/items");
    await page.getByPlaceholder("Buscar item...").fill(name);
    const deleteButton = page.getByRole("button", { name: `Excluir ${name}` });
    await deleteButton.click();

    const dialog = page.getByRole("alertdialog", { name: `Excluir "${name}"?` });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancelar" })).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(deleteButton).toBeFocused();
    await expect(page.locator("tbody tr")).toContainText(name);
  });

  test("does not delete an item used in a meal", async ({ page, data }) => {
    const name = `Rice in use ${data.suffix}`;
    const itemId = await data.createItem({
      name,
      unit: "g",
      calories: 128,
      protein: 2.5,
      carbohydrate: 28.1,
      fat: 0.2,
    });
    await data.createMeal({
      name: `Lunch ${data.suffix}`,
      date: "2026-01-15",
      items: [{ itemId, quantity: 100 }],
    });

    await page.goto("/items");
    await page.getByPlaceholder("Buscar item...").fill(name);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.getByRole("button", { name: `Excluir ${name}` }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();

    await expect(page.getByText("Este item está em uso em uma refeição e não pode ser excluído.")).toBeVisible();
    await expect(page.locator("tbody tr")).toContainText(name);
    expect(await data.findItemByName(name)).toBeDefined();
  });

  test("sorts and paginates items through the API, beyond the 100 most recent", async ({ page, data }) => {
    const oldestWithMostCalories = `Anchor ${data.suffix}`;
    await data.createItem({ name: oldestWithMostCalories, unit: "g", calories: 5000, protein: 0, carbohydrate: 0, fat: 0 });
    await Promise.all(
      Array.from({ length: 100 }, (_, index) => {
        const i = index + 1;
        const name = `Filler ${String(i).padStart(3, "0")} ${data.suffix}`;
        return data.createItem({ name, unit: "g", calories: i, protein: 0, carbohydrate: 0, fat: 0 });
      }),
    );
    const rows = page.locator("tbody tr");
    const summary = page.getByText(/^Mostrando/);

    await page.goto("/items");
    await page.getByPlaceholder("Buscar item...").fill(data.suffix);
    await expect(summary).toHaveText("Mostrando 1–8 de 101");

    await page.getByRole("combobox").selectOption("calories-desc");
    await expect(rows.first()).toContainText(oldestWithMostCalories);
    await expect(rows.nth(1)).toContainText(`Filler 100 ${data.suffix}`);

    await page.getByRole("button", { name: "Próxima página" }).click();
    await expect(summary).toHaveText("Mostrando 9–16 de 101");
    await expect(rows.first()).toContainText(`Filler 093 ${data.suffix}`);

    await page.getByRole("combobox").selectOption("name-asc");
    await expect(summary).toHaveText("Mostrando 1–8 de 101");
    await expect(rows.first()).toContainText(oldestWithMostCalories);
    await expect(rows.nth(1)).toContainText(`Filler 001 ${data.suffix}`);
  });

  test("goes back to the previous page after deleting the only item on the last page", async ({ page, data }) => {
    for (let i = 1; i <= 9; i++) {
      const name = `Page ${i} ${data.suffix}`;
      await data.createItem({ name, unit: "g", calories: i, protein: 0, carbohydrate: 0, fat: 0 });
    }
    const aloneOnPage2SortedByName = `Page 9 ${data.suffix}`;
    const summary = page.getByText(/^Mostrando/);

    await page.goto("/items");
    await page.getByPlaceholder("Buscar item...").fill(data.suffix);
    await expect(summary).toHaveText("Mostrando 1–8 de 9");
    await page.getByRole("button", { name: "Próxima página" }).click();
    await expect(summary).toHaveText("Mostrando 9–9 de 9");

    await page.getByRole("button", { name: `Excluir ${aloneOnPage2SortedByName}` }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();

    await expect(page.getByText("Item excluído com sucesso.")).toBeVisible();
    await expect(summary).toHaveText("Mostrando 1–8 de 8");
    await expect(page.locator("tbody tr")).toHaveCount(8);
  });
});

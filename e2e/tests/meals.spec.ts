import { expect, test } from "./fixtures";

test.describe("Meals", () => {
  test("creates a meal through the select, fixing an invalid quantity", async ({ page, data }) => {
    const pepper = `Jalapeño ${data.suffix}`;
    const egg = `Egg ${data.suffix}`;
    const mealName = `Lunch ${data.suffix}`;
    await data.createItem({ name: pepper, unit: "g", calories: 76, protein: 4.8, carbohydrate: 13.6, fat: 0.5 });
    await data.createItem({ name: egg, unit: "unit", calories: 72, protein: 6.3, carbohydrate: 0.4, fat: 4.8 });

    await page.goto("/meals/new");
    await page.fill("#meal-name", mealName);

    const search = page.getByPlaceholder("Buscar item...");
    await search.fill(`jalapeno ${data.suffix}`);
    await page.getByRole("button", { name: new RegExp(pepper) }).click();
    await search.fill(`egg ${data.suffix}`);
    await page.getByRole("button", { name: new RegExp(egg) }).click();

    const pepperQty = page.getByLabel(`Quantidade de ${pepper}`);
    const eggQty = page.getByLabel(`Quantidade de ${egg}`);
    await pepperQty.fill("0");
    await eggQty.fill("2");
    await page.getByRole("button", { name: "Salvar" }).click();

    const quantityError = page.getByText("A quantidade de cada item deve ser maior que 0.");
    await expect(quantityError).toBeVisible();
    await expect(pepperQty).toHaveAttribute("aria-invalid", "true");
    await expect(eggQty).toHaveAttribute("aria-invalid", "false");
    await expect(page).toHaveURL(/\/meals\/new$/);

    await pepperQty.fill("150");
    await expect(quantityError).toBeHidden();
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Refeição criada com sucesso!")).toBeVisible();
    await expect(page).toHaveURL(/\/meals$/);

    await page.getByRole("cell", { name: mealName, exact: true }).click();
    await expect(page).toHaveURL(/\/meals\/\d+$/);
    await expect(page.getByRole("heading", { name: mealName })).toBeVisible();
    await expect(page.getByText("Calorias totais").locator("..")).toContainText(String((150 / 100) * 76 + 2 * 72));

    const saved = await data.findMealByName(mealName);
    const meal = await (await data.getMeal(saved!.id)).json();
    expect(meal.items).toEqual([
      expect.objectContaining({ name: pepper, quantity: 150 }),
      expect.objectContaining({ name: egg, quantity: 2 }),
    ]);
  });

  test("edits and deletes a meal", async ({ page, data }) => {
    const rice = `Rice ${data.suffix}`;
    const original = `Dinner ${data.suffix}`;
    const renamed = `Supper ${data.suffix}`;
    const riceId = await data.createItem({
      name: rice,
      unit: "g",
      calories: 128,
      protein: 2.5,
      carbohydrate: 28.1,
      fat: 0.2,
    });
    const description = "Light dinner after training";
    const mealId = await data.createMeal({
      name: original,
      description,
      date: "2026-01-15",
      items: [{ itemId: riceId, quantity: 100 }],
    });

    await page.goto("/meals");
    await page.getByPlaceholder("Buscar refeição...").fill(original);
    await page.getByRole("link", { name: `Editar ${original}` }).click();
    await expect(page).toHaveURL(new RegExp(`/meals/${mealId}/edit$`));

    await expect(page.getByLabel("Descrição")).toHaveValue(description);
    await page.fill("#meal-name", renamed);
    await page.getByLabel(`Quantidade de ${rice}`).fill("200");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Refeição atualizada com sucesso!")).toBeVisible();
    await expect(page).toHaveURL(/\/meals$/);

    await page.getByPlaceholder("Buscar refeição...").fill(renamed);
    const row = page.locator("tbody tr");
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(String((200 / 100) * 128));
    expect(await (await data.getMeal(mealId)).json()).toMatchObject({ name: renamed, description });

    await page.getByRole("button", { name: `Excluir ${renamed}` }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();

    await expect(page.getByText("Refeição excluída com sucesso.")).toBeVisible();
    await expect(page.getByRole("cell", { name: renamed, exact: true })).toHaveCount(0);
    expect((await data.getMeal(mealId)).status()).toBe(404);
  });

  test("opens a meal from the list with the keyboard", async ({ page, data }) => {
    const rice = `Rice ${data.suffix}`;
    const mealName = `Breakfast ${data.suffix}`;
    const riceId = await data.createItem({ name: rice, unit: "g", calories: 128, protein: 2.5, carbohydrate: 28.1, fat: 0.2 });
    const mealId = await data.createMeal({ name: mealName, date: "2026-01-15", items: [{ itemId: riceId, quantity: 100 }] });

    await page.goto("/meals");
    await page.getByPlaceholder("Buscar refeição...").fill(mealName);
    await page.getByRole("link", { name: mealName, exact: true }).focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(new RegExp(`/meals/${mealId}$`));
    await expect(page.getByRole("heading", { name: mealName })).toBeVisible();
  });

  test("searches and paginates meals through the API, beyond the 100 most recent", async ({ page, data }) => {
    const riceId = await data.createItem({ name: `Rice ${data.suffix}`, unit: "g", calories: 128, protein: 2.5, carbohydrate: 28.1, fat: 0.2 });
    const oldest = `Oldest supper ${data.suffix}`;
    await data.createMeal({ name: oldest, date: "2020-01-01", items: [{ itemId: riceId, quantity: 100 }] });
    await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        data.createMeal({ name: `Filler meal ${i} ${data.suffix}`, date: "2026-01-15", items: [{ itemId: riceId, quantity: 100 }] }),
      ),
    );
    const rows = page.locator("tbody tr");
    const summary = page.getByText(/^Mostrando/);

    await page.goto("/meals");
    await page.getByPlaceholder("Buscar refeição...").fill(data.suffix);
    await expect(summary).toHaveText("Mostrando 1–8 de 101");
    await page.getByRole("button", { name: "Próxima página" }).click();
    await expect(summary).toHaveText("Mostrando 9–16 de 101");

    await page.getByPlaceholder("Buscar refeição...").fill(`oldest supper ${data.suffix}`);
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(oldest);
    await expect(summary).toHaveText("Mostrando 1–1 de 1");
  });

  test("finds an item beyond the 100 most recent in the select", async ({ page, data }) => {
    const target = `Tapioca ${data.suffix}`;
    await data.createItem({ name: target, unit: "g", calories: 240, protein: 0, carbohydrate: 60, fat: 0 });
    const apiMaxPageSize = 100;
    await Promise.all(
      Array.from({ length: apiMaxPageSize }, (_, i) =>
        data.createItem({ name: `Filler ${i} ${data.suffix}`, unit: "g", calories: 1, protein: 0, carbohydrate: 0, fat: 0 }),
      ),
    );

    await page.goto("/meals/new");
    await page.getByPlaceholder("Buscar item...").fill(`tapioca ${data.suffix}`);
    await page.getByRole("button", { name: new RegExp(target) }).click();

    await expect(page.getByLabel(`Quantidade de ${target}`)).toHaveValue("100");
    await expect(page.getByText("Total da refeição").locator("..")).toContainText("240 kcal");
  });
});

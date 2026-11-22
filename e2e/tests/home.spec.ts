import { expect, test } from "./fixtures";

function todayISODate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

test.describe("Home", () => {
  test("summarizes today's meals, the recent ones and the most used items", async ({ page, data }) => {
    const rice = `Rice ${data.suffix}`;
    const riceId = await data.createItem({ name: rice, unit: "g", calories: 130, protein: 2.5, carbohydrate: 28, fat: 0.5 });
    const today = `Today lunch ${data.suffix}`;
    await data.createMeal({ name: today, date: todayISODate(), items: [{ itemId: riceId, quantity: 200 }] });
    for (const name of [`Old dinner ${data.suffix}`, `Old supper ${data.suffix}`]) {
      await data.createMeal({ name, date: "2020-01-01", items: [{ itemId: riceId, quantity: 100 }] });
    }

    await page.goto("/");

    await expect(page.getByText("Total de calorias").locator("..")).toContainText("260kcal");
    await expect(page.getByText("Proteínas", { exact: true }).first().locator("..")).toContainText("5g");
    await expect(page.getByRole("link", { name: new RegExp(today) })).toBeVisible();
    const mostUsed = page.locator("section").filter({ hasText: "Itens mais utilizados" });
    await expect(mostUsed.getByText(rice).locator("..")).toContainText("3x");
  });

  test("totals every meal of the day, beyond the 100 the API lists per page", async ({ page, data }) => {
    const oatsId = await data.createItem({ name: `Oats ${data.suffix}`, unit: "g", calories: 100, protein: 1, carbohydrate: 10, fat: 1 });
    const mealsToday = 101;
    await Promise.all(
      Array.from({ length: mealsToday }, (_, i) =>
        data.createMeal({ name: `Snack ${i} ${data.suffix}`, date: todayISODate(), items: [{ itemId: oatsId, quantity: 100 }] }),
      ),
    );

    await page.goto("/");

    await expect(page.getByText("Total de calorias").locator("..")).toContainText(`${mealsToday * 100}kcal`);
    await expect(page.getByText("Proteínas", { exact: true }).first().locator("..")).toContainText(`${mealsToday}g`);
  });
});

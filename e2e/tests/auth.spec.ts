import { expect, PASSWORD, registerThrough, test, uniqueEmail } from "./fixtures";

test.describe("Auth", () => {
  test.use({ loggedIn: false });

  test("creates an account, logs out and logs back in", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: false }).first().fill(PASSWORD);
    await page.getByLabel("Confirmar senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Conta criada com sucesso!")).toBeVisible();
    await expect(page.getByRole("banner").getByText(email)).toBeVisible();

    await page.reload();
    await expect(page.getByRole("banner").getByText(email)).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL("/login");

    await page.goto("/");
    await expect(page).toHaveURL("/login?next=%2F");

    await page.getByLabel("E-mail").fill(email.toUpperCase());
    await page.getByLabel("Senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("banner").getByText(email)).toBeVisible();
  });

  test("refuses a wrong password", async ({ page, api }) => {
    const email = await registerThrough(api, uniqueEmail("e2e-wrong"));

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill("wrong horse battery");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("refuses an email that already has an account", async ({ page, api }) => {
    const email = await registerThrough(api, uniqueEmail("e2e-taken"));

    await page.goto("/register");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: false }).first().fill(PASSWORD);
    await page.getByLabel("Confirmar senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Já existe uma conta com esse e-mail.")).toBeVisible();
  });

  test("sends an anonymous visitor to the login and back to the page after logging in", async ({ page, api }) => {
    const email = await registerThrough(api);

    await page.goto("/meals?page=1");

    await expect(page).toHaveURL("/login?next=%2Fmeals%3Fpage%3D1");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/meals?page=1");
    await expect(page.getByRole("heading", { name: "Refeições" })).toBeVisible();
  });

  test("goes back to the login when the session ends in the middle of the use", async ({ page, api, context }) => {
    await registerThrough(api);
    await context.addCookies((await api.storageState()).cookies);
    await page.goto("/items");
    await expect(page.getByRole("heading", { name: "Itens" })).toBeVisible();

    await api.post("/auth/logout");
    await page.getByRole("link", { name: "Refeições" }).first().click();

    await expect(page).toHaveURL(/\/login\?next=/);
  });
});

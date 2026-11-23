import { expect, test } from "./fixtures";
import { API_URL } from "../env";

const PASSWORD = "correct horse battery";

test.describe("Auth", () => {
  test("creates an account, logs out and logs back in", async ({ page, data }) => {
    const email = `e2e-${data.suffix}@example.com`;

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
    await expect(page.getByRole("banner").getByRole("link", { name: "Entrar" })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email.toUpperCase());
    await page.getByLabel("Senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("banner").getByText(email)).toBeVisible();
  });

  test("refuses a wrong password", async ({ page, data }) => {
    const email = `e2e-wrong-${data.suffix}@example.com`;
    await page.request.post(`${API_URL}/auth/register`, { data: { email, password: PASSWORD } });
    await page.context().clearCookies();

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill("wrong horse battery");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("refuses an email that already has an account", async ({ page, data }) => {
    const email = `e2e-taken-${data.suffix}@example.com`;
    await page.request.post(`${API_URL}/auth/register`, { data: { email, password: PASSWORD } });
    await page.context().clearCookies();

    await page.goto("/register");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: false }).first().fill(PASSWORD);
    await page.getByLabel("Confirmar senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Já existe uma conta com esse e-mail.")).toBeVisible();
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "../../src/App";
import { getCurrentUser } from "../../src/services/authService";
import { getMeal } from "../../src/services/mealService";

vi.mock("../../src/services/authService");
vi.mock("../../src/services/mealService");

function renderAppAt(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App routes", () => {
  beforeEach(() => {
    vi.mocked(getMeal).mockReturnValue(new Promise(() => {}));
  });

  test.each([
    "/",
    "/items",
    "/items/new",
    "/items/3/edit",
    "/meals",
    "/meals/new",
    "/meals/7",
    "/meals/7/edit",
  ])("sends an anonymous visitor of %s to the login", async (route) => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    renderAppAt(route);

    expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  test("opens the page for a logged in user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 1, email: "ana@example.com" });

    renderAppAt("/meals/7");

    expect(await screen.findByText("ana@example.com")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Entrar" })).not.toBeInTheDocument();
  });

  test.each(["/login", "/register"])("keeps %s open to anonymous visitors", async (route) => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    renderAppAt(route);

    expect(await screen.findByRole("heading", { name: /Entrar|Criar conta/ })).toBeInTheDocument();
  });
});

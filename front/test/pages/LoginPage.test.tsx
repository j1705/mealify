import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LoginPage from "../../src/pages/auth/LoginPage";
import { renderWithAuth } from "../renderWithAuth";

function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/Senha/), { target: { value: password } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginPage", () => {
  test("asks for the email and the password without calling the API", () => {
    const { auth } = renderWithAuth(<LoginPage />, { route: "/login" });

    submit();

    expect(screen.getByText("Informe o e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  test("logs in with the trimmed email and the password as typed", async () => {
    const { auth } = renderWithAuth(<LoginPage />, { route: "/login" });
    fill("  ana@example.com ", " secret pass ");

    submit();

    await waitFor(() =>
      expect(auth.login).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: " secret pass ",
      }),
    );
  });

  test("goes to the home page after logging in", async () => {
    renderWithAuth(<LoginPage />, { route: "/login" });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByTestId("location")).toHaveTextContent(/^\/$/);
  });

  test("goes back to the page that asked for the login", async () => {
    renderWithAuth(<LoginPage />, { route: "/login?next=%2Fmeals%3Fpage%3D2" });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByTestId("location")).toHaveTextContent("/meals?page=2");
  });

  test("ignores a next address outside the app", async () => {
    renderWithAuth(<LoginPage />, { route: "/login?next=https%3A%2F%2Fevil.example" });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByTestId("location")).toHaveTextContent(/^\/$/);
  });

  test("shows why the login failed and stays on the page", async () => {
    renderWithAuth(<LoginPage />, {
      route: "/login",
      auth: { login: vi.fn().mockRejectedValue(new Error("E-mail ou senha incorretos.")) },
    });
    fill("ana@example.com", "wrong pass");

    submit();

    expect(await screen.findByText("E-mail ou senha incorretos.")).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });

  test("disables the form while logging in", async () => {
    renderWithAuth(<LoginPage />, {
      route: "/login",
      auth: { login: vi.fn().mockReturnValue(new Promise(() => {})) },
    });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByRole("button", { name: "Entrando..." })).toBeDisabled();
  });

  test("sends an already logged in user straight to the next page", async () => {
    renderWithAuth(<LoginPage />, {
      route: "/login?next=%2Fitems",
      auth: { status: "authenticated", user: { userId: 1, email: "ana@example.com" } },
    });

    expect(await screen.findByTestId("location")).toHaveTextContent("/items");
  });

  test("links to the registration keeping the next page", () => {
    renderWithAuth(<LoginPage />, { route: "/login?next=%2Fmeals" });

    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/register?next=%2Fmeals",
    );
  });
});

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import RegisterPage from "../../src/pages/auth/RegisterPage";
import { renderWithAuth } from "../renderWithAuth";

function fill(email: string, password: string, confirmation = password) {
  fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/Confirmar senha/), { target: { value: confirmation } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
}

describe("RegisterPage", () => {
  test("checks the email, the password length and the confirmation before calling the API", () => {
    const { auth } = renderWithAuth(<RegisterPage />, { route: "/register" });
    fill("ana", "short", "other");

    submit();

    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não conferem.")).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  test("creates the account with the trimmed email and the password as typed", async () => {
    const { auth } = renderWithAuth(<RegisterPage />, { route: "/register" });
    fill(" ana@example.com ", " secret pass ");

    submit();

    await waitFor(() =>
      expect(auth.register).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: " secret pass ",
      }),
    );
  });

  test("welcomes the user and goes to the page that asked for the login", async () => {
    renderWithAuth(<RegisterPage />, { route: "/register?next=%2Fmeals" });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByTestId("location")).toHaveTextContent("/meals");
    expect(screen.getByText("Conta criada com sucesso!")).toBeInTheDocument();
  });

  test("shows why the account could not be created", async () => {
    renderWithAuth(<RegisterPage />, {
      route: "/register",
      auth: {
        register: vi.fn().mockRejectedValue(new Error("Já existe uma conta com esse e-mail.")),
      },
    });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByText("Já existe uma conta com esse e-mail.")).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  test("disables the form while creating the account", async () => {
    renderWithAuth(<RegisterPage />, {
      route: "/register",
      auth: { register: vi.fn().mockReturnValue(new Promise(() => {})) },
    });
    fill("ana@example.com", "secret pass");

    submit();

    expect(await screen.findByRole("button", { name: "Criando conta..." })).toBeDisabled();
  });

  test("sends an already logged in user straight to the next page", async () => {
    renderWithAuth(<RegisterPage />, {
      route: "/register?next=%2Fitems",
      auth: { status: "authenticated", user: { userId: 1, email: "ana@example.com" } },
    });

    expect(await screen.findByTestId("location")).toHaveTextContent("/items");
  });

  test("links to the login keeping the next page", () => {
    renderWithAuth(<RegisterPage />, { route: "/register?next=%2Fmeals" });

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login?next=%2Fmeals",
    );
  });
});

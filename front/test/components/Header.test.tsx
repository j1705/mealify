import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Header from "../../src/components/layout/Header";
import { renderWithAuth } from "../renderWithAuth";

const ana = { userId: 1, email: "ana@example.com" };

describe("Header", () => {
  test("shows the email of the logged in user", () => {
    renderWithAuth(<Header onMenuClick={() => {}} />, {
      auth: { status: "authenticated", user: ana },
    });

    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  test("logs out, leaving the redirection to the login to the protected routes", async () => {
    const { auth } = renderWithAuth(<Header onMenuClick={() => {}} />, {
      auth: { status: "authenticated", user: ana },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(auth.logout).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  test("warns when the logout fails and stays on the page", async () => {
    renderWithAuth(<Header onMenuClick={() => {}} />, {
      auth: {
        status: "authenticated",
        user: ana,
        logout: vi.fn().mockRejectedValue(new Error("Não foi possível sair")),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    expect(await screen.findByText("Não foi possível sair")).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  test("offers the login to an anonymous visitor", () => {
    renderWithAuth(<Header onMenuClick={() => {}} />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });

  test("shows no account actions while the session is being checked", () => {
    renderWithAuth(<Header onMenuClick={() => {}} />, { auth: { status: "loading" } });

    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });
});

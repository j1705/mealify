import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { AuthContext, type AuthStatus } from "../../../src/components/auth/authContext";
import RequireAuth from "../../../src/components/auth/RequireAuth";
import CurrentLocation from "../../CurrentLocation";
import { fakeAuth } from "../../fakeAuth";

function renderAt(route: string, status: AuthStatus) {
  const user = status === "authenticated" ? { userId: 1, email: "ana@example.com" } : null;
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={fakeAuth({ status, user })}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/meals" element={<p>Minhas refeições</p>} />
          </Route>
          <Route path="/login" element={<CurrentLocation />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  test("shows the protected page to an authenticated user", () => {
    renderAt("/meals", "authenticated");

    expect(screen.getByText("Minhas refeições")).toBeInTheDocument();
  });

  test("sends an anonymous user to the login, remembering the page and its query", () => {
    renderAt("/meals?page=2", "anonymous");

    expect(screen.getByTestId("location")).toHaveTextContent("/login?next=%2Fmeals%3Fpage%3D2");
    expect(screen.queryByText("Minhas refeições")).not.toBeInTheDocument();
  });

  test("waits for the session check without showing the page or leaving it", () => {
    renderAt("/meals", "loading");

    expect(screen.getByRole("status")).toHaveTextContent("Verificando sua sessão...");
    expect(screen.queryByText("Minhas refeições")).not.toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });
});

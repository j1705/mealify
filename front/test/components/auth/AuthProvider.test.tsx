import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthProvider } from "../../../src/components/auth/AuthProvider";
import { useAuth } from "../../../src/components/auth/authContext";
import { getCurrentUser, login, logout, registerUser } from "../../../src/services/authService";
import { request } from "../../../src/services/http";

vi.mock("../../../src/services/authService");

const ana = { userId: 1, email: "ana@example.com" };
const credentials = { email: "ana@example.com", password: "correct horse" };

function Probe() {
  const auth = useAuth();
  const [error, setError] = useState<string>();
  const run = (action: () => Promise<void>) => () =>
    action().catch((e: Error) => setError(e.message));
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="email">{auth.user?.email ?? ""}</span>
      <span data-testid="error">{error ?? ""}</span>
      <button onClick={run(() => auth.login(credentials))}>login</button>
      <button onClick={run(() => auth.register(credentials))}>register</button>
      <button onClick={run(() => auth.logout())}>logout</button>
    </div>
  );
}

function renderProbe() {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

const status = () => screen.getByTestId("status").textContent;
const email = () => screen.getByTestId("email").textContent;

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
  });

  test("starts loading while it asks the API for the current session", async () => {
    vi.mocked(getCurrentUser).mockReturnValue(new Promise(() => {}));

    renderProbe();

    expect(status()).toBe("loading");
  });

  test("becomes authenticated with the user of the current session", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(ana);

    renderProbe();

    await waitFor(() => expect(status()).toBe("authenticated"));
    expect(email()).toBe("ana@example.com");
  });

  test("becomes anonymous when there is no session", async () => {
    renderProbe();

    await waitFor(() => expect(status()).toBe("anonymous"));
    expect(email()).toBe("");
  });

  test("becomes anonymous when the session cannot be checked", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("Não foi possível conectar"));

    renderProbe();

    await waitFor(() => expect(status()).toBe("anonymous"));
  });

  test.each([
    ["login", login],
    ["register", registerUser],
  ] as const)("becomes authenticated after %s", async (button, action) => {
    vi.mocked(action).mockResolvedValue(ana);
    renderProbe();
    await waitFor(() => expect(status()).toBe("anonymous"));

    fireEvent.click(screen.getByText(button));

    await waitFor(() => expect(status()).toBe("authenticated"));
    expect(action).toHaveBeenCalledWith(credentials);
    expect(email()).toBe("ana@example.com");
  });

  test("stays anonymous and lets the caller show why the login failed", async () => {
    vi.mocked(login).mockRejectedValue(new Error("E-mail ou senha incorretos."));
    renderProbe();
    await waitFor(() => expect(status()).toBe("anonymous"));

    fireEvent.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("error")).toHaveTextContent("E-mail ou senha"));
    expect(status()).toBe("anonymous");
  });

  test("becomes anonymous after logout", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(ana);
    vi.mocked(logout).mockResolvedValue();
    renderProbe();
    await waitFor(() => expect(status()).toBe("authenticated"));

    fireEvent.click(screen.getByText("logout"));

    await waitFor(() => expect(status()).toBe("anonymous"));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test("keeps the session when the logout fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(ana);
    vi.mocked(logout).mockRejectedValue(new Error("Não foi possível sair"));
    renderProbe();
    await waitFor(() => expect(status()).toBe("authenticated"));

    await act(async () => fireEvent.click(screen.getByText("logout")));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Não foi possível sair"),
    );
    expect(status()).toBe("authenticated");
  });

  test("keeps a login made while the initial check was still running", async () => {
    let answerInitialCheck: (user: null) => void = () => {};
    vi.mocked(getCurrentUser).mockReturnValue(
      new Promise((resolve) => {
        answerInitialCheck = resolve;
      }),
    );
    vi.mocked(login).mockResolvedValue(ana);
    renderProbe();

    fireEvent.click(screen.getByText("login"));
    await waitFor(() => expect(status()).toBe("authenticated"));
    await act(async () => answerInitialCheck(null));

    expect(status()).toBe("authenticated");
  });

  test("becomes anonymous when a request finds the session gone", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(ana);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: "Authentication required" }), { status: 401 }),
        ),
    );
    renderProbe();
    await waitFor(() => expect(status()).toBe("authenticated"));

    await act(async () => {
      await request("/meals", "Falhou").catch(() => {});
    });

    expect(status()).toBe("anonymous");
    vi.unstubAllGlobals();
  });

  test("refuses to be used outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow("useAuth deve ser usado dentro de AuthProvider");
  });
});

import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext, type AuthContextValue } from "../src/components/auth/authContext";
import { ToastProvider } from "../src/components/ui/ToastProvider";
import CurrentLocation from "./CurrentLocation";
import { fakeAuth } from "./fakeAuth";

type RenderWithAuthOptions = {
  route?: string;
  path?: string;
  auth?: Partial<AuthContextValue>;
};

export function renderWithAuth(
  ui: ReactElement,
  { route = "/", path = route.split("?")[0], auth = {} }: RenderWithAuthOptions = {},
) {
  const value = fakeAuth(auth);
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthContext.Provider value={value}>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={<CurrentLocation />} />
          </Routes>
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>,
  );
  return { ...view, auth: value };
}

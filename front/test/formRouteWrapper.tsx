import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "../src/components/ui/ToastProvider";

export function formRouteWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/form"]}>
      <ToastProvider>
        <Routes>
          <Route path="/form" element={children} />
          <Route path="/meals" element={<p>Meals list</p>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
}

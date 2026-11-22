import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { useNumericParam } from "../../src/hooks/useNumericParam";

function renderAt(path: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/meals/:mealId" element={children} />
        <Route path="/meals" element={children} />
      </Routes>
    </MemoryRouter>
  );
  return renderHook(() => useNumericParam("mealId"), { wrapper }).result.current;
}

describe("useNumericParam", () => {
  test("reads a positive integer id", () => {
    expect(renderAt("/meals/42")).toBe(42);
  });

  test.each(["/meals/abc", "/meals/0", "/meals/-3", "/meals/1.5", "/meals/1e3", "/meals/%20"])(
    "rejects %s",
    (path) => {
      expect(renderAt(path)).toBeNull();
    },
  );

  test("rejects a missing parameter", () => {
    expect(renderAt("/meals")).toBeNull();
  });

  test("rejects an id beyond the safe integer range", () => {
    expect(renderAt("/meals/9007199254740993")).toBeNull();
  });
});

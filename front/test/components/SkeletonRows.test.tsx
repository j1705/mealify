import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SkeletonRows } from "../../src/components/ui/Skeleton";

describe("SkeletonRows", () => {
  test("renders the given number of placeholder rows with the given height", () => {
    const { container } = render(<SkeletonRows rows={4} height={30} />);

    const rows = container.querySelectorAll("[data-skeleton]");
    expect(rows).toHaveLength(4);
    rows.forEach((row) => expect(row).toHaveStyle({ height: "30px" }));
  });
});

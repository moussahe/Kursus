import { describe, it, expect } from "vitest";

describe("Example Tests", () => {
  it("basic math works", () => {
    expect(1 + 1).toBe(2);
  });

  it("string concatenation works", () => {
    expect("Hello, " + "Kursus!").toBe("Hello, Kursus!");
  });

  it("array operations work", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});

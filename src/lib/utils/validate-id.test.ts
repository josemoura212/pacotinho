import { describe, expect, it } from "vitest";
import { isValidUUID } from "./validate-id";

describe("isValidUUID", () => {
  it("aceita UUID v4 válido", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("aceita UUID com letras minúsculas", () => {
    expect(isValidUUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(true);
  });

  it("rejeita string vazia", () => {
    expect(isValidUUID("")).toBe(false);
  });

  it("rejeita string aleatória", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });

  it("rejeita UUID com formato parcial", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
  });

  it("rejeita UUID com caracteres inválidos", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-44665544zzzz")).toBe(false);
  });

  it("rejeita número", () => {
    expect(isValidUUID("12345")).toBe(false);
  });
});

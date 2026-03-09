import { describe, expect, it } from "vitest";
import { loginSchema, passwordSchema } from "./auth";

describe("loginSchema", () => {
  it("valida login correto", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita email inválido", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("faz lowercase no email", () => {
    const result = loginSchema.safeParse({
      email: "User@EXAMPLE.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });
});

describe("passwordSchema", () => {
  it("aceita senha forte", () => {
    const result = passwordSchema.safeParse("Abc123!@#");
    expect(result.success).toBe(true);
  });

  it("rejeita senha curta", () => {
    const result = passwordSchema.safeParse("Ab1!");
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem maiúscula", () => {
    const result = passwordSchema.safeParse("abc12345!");
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem número", () => {
    const result = passwordSchema.safeParse("Abcdefgh!");
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem caractere especial", () => {
    const result = passwordSchema.safeParse("Abcdef123");
    expect(result.success).toBe(false);
  });
});

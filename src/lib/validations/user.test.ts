import { describe, expect, it } from "vitest";
import { createUserSchema, updateUserSchema } from "./user";

describe("createUserSchema", () => {
  it("valida dados corretos de ADMIN", () => {
    const result = createUserSchema.safeParse({
      name: "Admin User",
      email: "admin@test.com",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
  });

  it("valida dados corretos de MORADOR com apartamento e bloco", () => {
    const result = createUserSchema.safeParse({
      name: "João Silva",
      email: "joao@test.com",
      role: "MORADOR",
      apartment: "101",
      block: "A",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita MORADOR sem apartamento", () => {
    const result = createUserSchema.safeParse({
      name: "João Silva",
      email: "joao@test.com",
      role: "MORADOR",
      block: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita MORADOR sem bloco", () => {
    const result = createUserSchema.safeParse({
      name: "João Silva",
      email: "joao@test.com",
      role: "MORADOR",
      apartment: "101",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome curto", () => {
    const result = createUserSchema.safeParse({
      name: "A",
      email: "a@test.com",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita email inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Test User",
      email: "invalid",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita role inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      role: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("faz trim no nome", () => {
    const result = createUserSchema.safeParse({
      name: "  João Silva  ",
      email: "joao@test.com",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("João Silva");
    }
  });

  it("aceita senha forte opcional", () => {
    const result = createUserSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      role: "ADMIN",
      password: "Abc123!@#",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita senha fraca quando fornecida", () => {
    const result = createUserSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      role: "ADMIN",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("aceita atualização parcial", () => {
    const result = updateUserSchema.safeParse({
      name: "Novo Nome",
    });
    expect(result.success).toBe(true);
  });

  it("aceita objeto vazio", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("valida email quando fornecido", () => {
    const result = updateUserSchema.safeParse({
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("aceita active boolean", () => {
    const result = updateUserSchema.safeParse({
      active: false,
    });
    expect(result.success).toBe(true);
  });
});

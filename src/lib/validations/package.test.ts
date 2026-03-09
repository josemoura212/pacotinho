import { describe, expect, it } from "vitest";
import {
  completeRegistrationSchema,
  createPackageSchema,
  updatePackageSchema,
} from "./package";

describe("createPackageSchema", () => {
  it("aceita objeto vazio (todos opcionais)", () => {
    const result = createPackageSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("aceita dados completos", () => {
    const result = createPackageSchema.safeParse({
      trackingCode: "BR123456789",
      residentId: "550e8400-e29b-41d4-a716-446655440000",
      notes: "Pacote grande",
    });
    expect(result.success).toBe(true);
  });

  it("valida formato do photoPath", () => {
    const validResult = createPackageSchema.safeParse({
      photoPath: "550e8400-e29b-41d4-a716-446655440000.jpg",
    });
    expect(validResult.success).toBe(true);

    const invalidResult = createPackageSchema.safeParse({
      photoPath: "malicious.exe",
    });
    expect(invalidResult.success).toBe(false);
  });

  it("valida residentId como UUID", () => {
    const result = createPackageSchema.safeParse({
      residentId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("limita notes a 1000 caracteres", () => {
    const result = createPackageSchema.safeParse({
      notes: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("updatePackageSchema", () => {
  it("aceita atualização parcial", () => {
    const result = updatePackageSchema.safeParse({
      trackingCode: "BR987654321",
    });
    expect(result.success).toBe(true);
  });

  it("aceita objeto vazio", () => {
    const result = updatePackageSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("completeRegistrationSchema", () => {
  it("requer trackingCode e residentId", () => {
    const result = completeRegistrationSchema.safeParse({
      trackingCode: "BR123456789",
      residentId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem trackingCode", () => {
    const result = completeRegistrationSchema.safeParse({
      residentId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita sem residentId", () => {
    const result = completeRegistrationSchema.safeParse({
      trackingCode: "BR123456789",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita trackingCode vazio", () => {
    const result = completeRegistrationSchema.safeParse({
      trackingCode: "",
      residentId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("faz trim no trackingCode", () => {
    const result = completeRegistrationSchema.safeParse({
      trackingCode: "  BR123456789  ",
      residentId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trackingCode).toBe("BR123456789");
    }
  });
});

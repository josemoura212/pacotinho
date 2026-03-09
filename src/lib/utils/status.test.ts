import { describe, expect, it } from "vitest";
import { getStatusColor, getStatusLabel } from "./status";

describe("getStatusLabel", () => {
  it("retorna label para REGISTRO_PENDENTE", () => {
    expect(getStatusLabel("REGISTRO_PENDENTE")).toBe("Registro Pendente");
  });

  it("retorna label para ENTREGA_PENDENTE", () => {
    expect(getStatusLabel("ENTREGA_PENDENTE")).toBe("Entrega Pendente");
  });

  it("retorna label para ENTREGA_CONCLUIDA", () => {
    expect(getStatusLabel("ENTREGA_CONCLUIDA")).toBe("Entrega Concluída");
  });
});

describe("getStatusColor", () => {
  it("retorna cor amarela para REGISTRO_PENDENTE", () => {
    expect(getStatusColor("REGISTRO_PENDENTE")).toContain("yellow");
  });

  it("retorna cor azul para ENTREGA_PENDENTE", () => {
    expect(getStatusColor("ENTREGA_PENDENTE")).toContain("blue");
  });

  it("retorna cor verde para ENTREGA_CONCLUIDA", () => {
    expect(getStatusColor("ENTREGA_CONCLUIDA")).toContain("green");
  });

  it("retorna classes CSS válidas", () => {
    const color = getStatusColor("REGISTRO_PENDENTE");
    expect(color).toMatch(/^bg-\w+-\d+ text-\w+-\d+$/);
  });
});

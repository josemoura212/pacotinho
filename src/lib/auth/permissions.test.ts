import { describe, expect, it } from "vitest";
import { getRoutePermission, hasPermission } from "./permissions";

describe("hasPermission", () => {
  describe("ADMIN", () => {
    it("tem acesso ao dashboard", () => {
      expect(hasPermission("ADMIN", "dashboard")).toBe(true);
    });

    it("tem acesso a gerenciar usuários", () => {
      expect(hasPermission("ADMIN", "users:list")).toBe(true);
      expect(hasPermission("ADMIN", "users:create")).toBe(true);
      expect(hasPermission("ADMIN", "users:edit")).toBe(true);
      expect(hasPermission("ADMIN", "users:delete")).toBe(true);
    });

    it("tem acesso a relatórios", () => {
      expect(hasPermission("ADMIN", "reports:view")).toBe(true);
    });

    it("tem acesso a todas as operações de encomendas", () => {
      expect(hasPermission("ADMIN", "packages:create")).toBe(true);
      expect(hasPermission("ADMIN", "packages:list")).toBe(true);
      expect(hasPermission("ADMIN", "packages:edit")).toBe(true);
      expect(hasPermission("ADMIN", "packages:deliver")).toBe(true);
      expect(hasPermission("ADMIN", "packages:confirm")).toBe(true);
    });
  });

  describe("PORTEIRO", () => {
    it("tem acesso ao dashboard", () => {
      expect(hasPermission("PORTEIRO", "dashboard")).toBe(true);
    });

    it("pode criar e listar encomendas", () => {
      expect(hasPermission("PORTEIRO", "packages:create")).toBe(true);
      expect(hasPermission("PORTEIRO", "packages:list")).toBe(true);
      expect(hasPermission("PORTEIRO", "packages:edit")).toBe(true);
      expect(hasPermission("PORTEIRO", "packages:deliver")).toBe(true);
    });

    it("não pode confirmar recebimento", () => {
      expect(hasPermission("PORTEIRO", "packages:confirm")).toBe(false);
    });

    it("não pode gerenciar usuários", () => {
      expect(hasPermission("PORTEIRO", "users:list")).toBe(false);
      expect(hasPermission("PORTEIRO", "users:create")).toBe(false);
      expect(hasPermission("PORTEIRO", "users:edit")).toBe(false);
      expect(hasPermission("PORTEIRO", "users:delete")).toBe(false);
    });

    it("não pode ver relatórios", () => {
      expect(hasPermission("PORTEIRO", "reports:view")).toBe(false);
    });

    it("pode listar e criar moradores", () => {
      expect(hasPermission("PORTEIRO", "residents:list")).toBe(true);
      expect(hasPermission("PORTEIRO", "residents:create")).toBe(true);
    });
  });

  describe("MORADOR", () => {
    it("tem acesso ao dashboard", () => {
      expect(hasPermission("MORADOR", "dashboard")).toBe(true);
    });

    it("pode listar encomendas e confirmar recebimento", () => {
      expect(hasPermission("MORADOR", "packages:list")).toBe(true);
      expect(hasPermission("MORADOR", "packages:confirm")).toBe(true);
    });

    it("não pode criar ou editar encomendas", () => {
      expect(hasPermission("MORADOR", "packages:create")).toBe(false);
      expect(hasPermission("MORADOR", "packages:edit")).toBe(false);
      expect(hasPermission("MORADOR", "packages:deliver")).toBe(false);
    });

    it("não pode gerenciar usuários", () => {
      expect(hasPermission("MORADOR", "users:list")).toBe(false);
      expect(hasPermission("MORADOR", "users:create")).toBe(false);
    });
  });
});

describe("getRoutePermission", () => {
  it("retorna resource correto para rotas conhecidas", () => {
    expect(getRoutePermission("/dashboard")).toBe("dashboard");
    expect(getRoutePermission("/encomendas/nova")).toBe("packages:create");
    expect(getRoutePermission("/usuarios")).toBe("users:list");
    expect(getRoutePermission("/relatorios")).toBe("reports:view");
    expect(getRoutePermission("/notificacoes/enviar")).toBe("notifications:send");
  });

  it("retorna null para rotas não mapeadas", () => {
    expect(getRoutePermission("/settings")).toBeNull();
    expect(getRoutePermission("/unknown")).toBeNull();
  });

  it("reconhece sub-rotas", () => {
    expect(getRoutePermission("/usuarios/123")).toBe("users:list");
    expect(getRoutePermission("/encomendas/nova/extra")).toBe("packages:create");
  });
});

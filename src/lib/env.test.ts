import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function loadEnv() {
    const mod = await import("./env");
    return mod.env;
  }

  describe("variáveis obrigatórias", () => {
    it("retorna DATABASE_URL quando definida", async () => {
      process.env.DATABASE_URL = "postgres://localhost/test";
      const env = await loadEnv();
      expect(env.DATABASE_URL).toBe("postgres://localhost/test");
    });

    it("lança erro quando DATABASE_URL não está definida", async () => {
      delete process.env.DATABASE_URL;
      const env = await loadEnv();
      expect(() => env.DATABASE_URL).toThrow("DATABASE_URL");
    });

    it("retorna AUTH_SECRET quando definida", async () => {
      process.env.AUTH_SECRET = "my-secret";
      const env = await loadEnv();
      expect(env.AUTH_SECRET).toBe("my-secret");
    });

    it("lança erro quando AUTH_SECRET não está definida", async () => {
      delete process.env.AUTH_SECRET;
      const env = await loadEnv();
      expect(() => env.AUTH_SECRET).toThrow("AUTH_SECRET");
    });
  });

  describe("variáveis opcionais", () => {
    it("retorna fallback para PORT", async () => {
      delete process.env.PORT;
      const env = await loadEnv();
      expect(env.PORT).toBe("3000");
    });

    it("retorna valor customizado para PORT", async () => {
      process.env.PORT = "8080";
      const env = await loadEnv();
      expect(env.PORT).toBe("8080");
    });

    it("retorna fallback para HOSTNAME", async () => {
      delete process.env.HOSTNAME;
      const env = await loadEnv();
      expect(env.HOSTNAME).toBe("0.0.0.0");
    });

    it("retorna fallback para UPLOAD_DIR", async () => {
      delete process.env.UPLOAD_DIR;
      const env = await loadEnv();
      expect(env.UPLOAD_DIR).toBe("./uploads");
    });

    it("retorna fallback vazio para VAPID_PUBLIC_KEY", async () => {
      delete process.env.VAPID_PUBLIC_KEY;
      const env = await loadEnv();
      expect(env.VAPID_PUBLIC_KEY).toBe("");
    });
  });

  describe("propriedades derivadas", () => {
    it("isSecure é true quando AUTH_URL usa https", async () => {
      process.env.AUTH_URL = "https://pacotinho.example.com";
      const env = await loadEnv();
      expect(env.isSecure).toBe(true);
    });

    it("isSecure é false quando AUTH_URL usa http", async () => {
      process.env.AUTH_URL = "http://localhost:3000";
      const env = await loadEnv();
      expect(env.isSecure).toBe(false);
    });

    it("isSecure usa fallback http quando AUTH_URL não definida", async () => {
      delete process.env.AUTH_URL;
      const env = await loadEnv();
      expect(env.isSecure).toBe(false);
    });

    it("cookieName inclui __Secure- quando https", async () => {
      process.env.AUTH_URL = "https://pacotinho.example.com";
      const env = await loadEnv();
      expect(env.cookieName).toBe("__Secure-authjs.session-token");
    });

    it("cookieName sem prefixo quando http", async () => {
      process.env.AUTH_URL = "http://localhost:3000";
      const env = await loadEnv();
      expect(env.cookieName).toBe("authjs.session-token");
    });
  });
});

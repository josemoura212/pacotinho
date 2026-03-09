import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite a primeira tentativa", () => {
    const result = checkRateLimit("test-key-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("permite até 5 tentativas na mesma janela", () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("test-key-2");
      expect(result.allowed).toBe(true);
    }
  });

  it("bloqueia na 6ª tentativa", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key-3");
    }
    const result = checkRateLimit("test-key-3");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("reseta após a janela de tempo", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-key-4");
    }
    const blocked = checkRateLimit("test-key-4");
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(61_000);

    const result = checkRateLimit("test-key-4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("usa chaves independentes", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-a");
    }
    const resultA = checkRateLimit("key-a");
    expect(resultA.allowed).toBe(false);

    const resultB = checkRateLimit("key-b");
    expect(resultB.allowed).toBe(true);
  });

  it("retorna resetIn correto", () => {
    const result = checkRateLimit("test-key-5");
    expect(result.resetIn).toBe(60_000);
  });

  it("decrementa remaining corretamente", () => {
    const r1 = checkRateLimit("test-key-6");
    expect(r1.remaining).toBe(4);

    const r2 = checkRateLimit("test-key-6");
    expect(r2.remaining).toBe(3);

    const r3 = checkRateLimit("test-key-6");
    expect(r3.remaining).toBe(2);
  });
});

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  ensureCleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  store.set(key, { count: entry.count + 1, resetAt: entry.resetAt });
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count - 1,
    resetIn: entry.resetAt - now,
  };
}

let cleanupStarted = false;

function ensureCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, WINDOW_MS);
  timer.unref();
}

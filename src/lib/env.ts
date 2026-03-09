function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  AUTH_SECRET: required("AUTH_SECRET"),
  AUTH_URL: optional("AUTH_URL", "http://localhost:3000"),
  UPLOAD_DIR: optional("UPLOAD_DIR", "./uploads"),

  VAPID_PUBLIC_KEY: optional("VAPID_PUBLIC_KEY", ""),
  VAPID_PRIVATE_KEY: optional("VAPID_PRIVATE_KEY", ""),
  VAPID_EMAIL: optional("VAPID_EMAIL", "mailto:admin@pacotinho.com"),

  PORT: optional("PORT", "3000"),
  HOSTNAME: optional("HOSTNAME", "0.0.0.0"),

  get isSecure() {
    return this.AUTH_URL.startsWith("https://");
  },

  get cookieName() {
    return this.isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  },
} as const;

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
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get AUTH_SECRET() {
    return required("AUTH_SECRET");
  },
  get AUTH_URL() {
    return optional("AUTH_URL", "http://localhost:3000");
  },
  get UPLOAD_DIR() {
    return optional("UPLOAD_DIR", "./uploads");
  },

  get VAPID_PUBLIC_KEY() {
    return optional("VAPID_PUBLIC_KEY", "");
  },
  get VAPID_PRIVATE_KEY() {
    return optional("VAPID_PRIVATE_KEY", "");
  },
  get VAPID_EMAIL() {
    return optional("VAPID_EMAIL", "mailto:admin@pacotinho.com");
  },

  get PORT() {
    return optional("PORT", "3000");
  },
  get HOSTNAME() {
    return optional("HOSTNAME", "0.0.0.0");
  },

  get isSecure() {
    return this.AUTH_URL.startsWith("https://");
  },

  get cookieName() {
    return this.isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  },
};

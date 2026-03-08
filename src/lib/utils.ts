import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOCALE = "pt-BR";
const TIMEZONE = "America/Sao_Paulo";

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString(LOCALE, { timeZone: TIMEZONE });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString(LOCALE, { timeZone: TIMEZONE });
}

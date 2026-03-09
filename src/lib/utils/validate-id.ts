import { z } from "zod/v4";

const uuidSchema = z.uuid();

export function isValidUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

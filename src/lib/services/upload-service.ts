import { writeFile, mkdir, readFile, access } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const MAGIC_BYTES: Record<string, number[]> = {
  ".jpg": [0xff, 0xd8, 0xff],
  ".jpeg": [0xff, 0xd8, 0xff],
  ".png": [0x89, 0x50, 0x4e, 0x47],
  ".webp": [0x52, 0x49, 0x46, 0x46],
};

function detectMimeType(buffer: Buffer): string | null {
  for (const [ext, bytes] of Object.entries(MAGIC_BYTES)) {
    const matches = bytes.every((byte, i) => buffer[i] === byte);
    if (matches) return ext;
  }
  return null;
}

export async function uploadFile(
  file: File,
): Promise<{ filename: string; path: string }> {
  if (file.size > MAX_SIZE) {
    throw new Error("Arquivo excede o tamanho máximo de 5MB");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Tipo de arquivo não permitido. Use: jpg, png ou webp");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const detectedType = detectMimeType(buffer);
  if (!detectedType) {
    throw new Error("Tipo de arquivo inválido (magic bytes não reconhecidos)");
  }

  const filename = `${crypto.randomUUID()}${detectedType}`;
  const uploadDir = path.resolve(UPLOAD_DIR);

  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return { filename, path: filePath };
}

export async function getFile(
  filename: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safeName = path.basename(filename);
  const filePath = path.join(path.resolve(UPLOAD_DIR), safeName);

  try {
    await access(filePath);
  } catch {
    return null;
  }

  const buffer = await readFile(filePath);
  const ext = path.extname(safeName).toLowerCase();

  const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };

  return {
    buffer,
    contentType: contentTypes[ext] || "application/octet-stream",
  };
}

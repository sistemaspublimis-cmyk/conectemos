import { randomUUID } from "crypto";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { ALLOWED_MIME } from "./constants";

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const maxMb = Number(process.env.MAX_UPLOAD_MB || 10);

export function isAllowedMime(mime: string) {
  return ALLOWED_MIME.includes(mime);
}

export function extensionFor(_mime: string, originalName: string) {
  const fromName = path.extname(originalName).toLowerCase();
  const cleaned = fromName.replace(/[^a-z0-9]/g, "");
  return cleaned ? `.${cleaned}` : ".bin";
}

export async function saveUpload(file: File) {
  if (!file.size) {
    throw new Error("El archivo está vacío.");
  }
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`El archivo supera el límite de ${maxMb} MB.`);
  }
  const ext = extensionFor(file.type, file.name);
  const storedName = `${randomUUID()}${ext}`;
  await mkdir(uploadDir, { recursive: true });
  const dest = path.join(uploadDir, storedName);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buf);
  return {
    storedName,
    originalName: path.basename(file.name).replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ]/g, "_"),
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function readStoredFile(storedName: string) {
  const safe = path.basename(storedName);
  const dest = path.join(uploadDir, safe);
  if (!dest.startsWith(uploadDir)) throw new Error("Ruta inválida");
  return readFile(dest);
}

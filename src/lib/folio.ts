import { prisma } from "./prisma";

export async function nextFolio(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `folio-${year}`;
  const seq = await prisma.sequence.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `CJC-${year}-${String(seq.value).padStart(5, "0")}`;
}

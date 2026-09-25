import { prisma } from "./prisma";

export type BannerDTO = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  href: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
};

export const DEFAULT_BANNERS: BannerDTO[] = [
  {
    id: "conectemos-banner-ahorro",
    title: "Ahorro con propósito",
    subtitle: "Próximamente en tu cuenta",
    body: "Consulta el fondo de ahorro ligado a tu crédito y carga tu comprobante de aportación desde tu cuenta.",
    cta: "Conocer ahorro",
    href: "/mi-cuenta/ahorro",
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1600&q=80",
    active: true,
    sortOrder: 1,
  },
  {
    id: "conectemos-banner-inversiones",
    title: "Inversiones Conectemos",
    subtitle: "Haz crecer tu capital",
    body: "Conoce los perfiles de inversión Conectemos y elige el que se ajuste a tu horizonte.",
    cta: "Ver inversiones",
    href: "/mi-cuenta/inversiones",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    active: true,
    sortOrder: 2,
  },
  {
    id: "conectemos-banner-credito",
    title: "Crédito personal Conectemos",
    subtitle: "Tu financiamiento, con claridad",
    body: "Sigue tu solicitud, documentos y estatus desde un solo lugar. Consulta el monto autorizado de tu financiamiento.",
    cta: "Ver mi financiamiento",
    href: "/mi-cuenta/solicitud",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
    active: true,
    sortOrder: 3,
  },
];

function asBanner(row: Record<string, unknown>): BannerDTO {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    body: String(row.body ?? ""),
    cta: String(row.cta ?? ""),
    href: String(row.href ?? ""),
    imageUrl: String(row.imageUrl ?? ""),
    active: Boolean(row.active),
    sortOrder: Number(row.sortOrder ?? 0),
  };
}

export async function getActiveBanners(): Promise<BannerDTO[]> {
  try {
    const delegate = (prisma as unknown as { banner?: { findMany: (args: unknown) => Promise<Record<string, unknown>[]> } }).banner;
    if (delegate?.findMany) {
      const rows = await delegate.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      });
      if (rows?.length) return rows.map(asBanner);
    }
  } catch {
    // Tabla o cliente Prisma aún no listos.
  }
  return DEFAULT_BANNERS.filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

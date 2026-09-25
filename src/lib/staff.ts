import type { Role } from "@prisma/client";
import { ADMIN_NAV_GROUPS, type AdminNavItem } from "./constants";

export const STAFF_ROLES: Role[] = ["ADMIN", "MANAGER", "ADVISOR"];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Dueño",
  MANAGER: "Gerente",
  ADVISOR: "Asesor",
  CLIENT: "Cliente",
};

export const ROLE_BLURB: Record<Exclude<Role, "CLIENT">, string> = {
  ADMIN: "Ve y configura todo el panel. Da de alta gerentes y asesores.",
  MANAGER: "Opera créditos y al equipo comercial. No cambia la configuración ni da de alta personal.",
  ADVISOR: "Atiende expedientes, solicitudes, comprobantes y avisos al cliente.",
};

const ADVISOR_HREFS = new Set([
  "/admin",
  "/admin/clientes",
  "/admin/solicitudes",
  "/admin/documentos",
  "/admin/notificaciones",
  "/admin/conversaciones",
  "/admin/whatsapp",
  "/admin/correos",
  "/admin/desembolsos",
]);

const MANAGER_HIDDEN = new Set(["/admin/usuarios", "/admin/configuracion", "/admin/bitacora"]);

export function isStaffRole(role: string): role is Role {
  return role === "ADMIN" || role === "MANAGER" || role === "ADVISOR";
}

export function navGroupsForRole(role: Role) {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessAdminPath(role, item.href)),
  })).filter((group) => group.items.length > 0);
}

export function canAccessAdminPath(role: Role, pathname: string) {
  if (role === "ADMIN") return true;
  const hrefs = ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
  const match = hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  const href = match || pathname;
  if (role === "MANAGER") return !MANAGER_HIDDEN.has(href);
  if (role === "ADVISOR") return ADVISOR_HREFS.has(href);
  return false;
}

export function allNavItems(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((g) => [...g.items]);
}

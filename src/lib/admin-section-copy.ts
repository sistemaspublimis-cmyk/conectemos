import { ADMIN_NAV } from "./constants";

export const ADMIN_WELCOME_KEY = "conectemos-admin-welcome-shown";
export const ADMIN_SECTION_KEY_PREFIX = "conectemos-admin-section-";

export type AdminSectionCopy = {
  href: string;
  title: string;
  lead: string;
  bullets: string[];
};

export const ADMIN_SECTION_COPY: Record<string, AdminSectionCopy> = {
  "/admin": {
    href: "/admin",
    title: "Dashboard",
    lead: "El tablero del día: cifras, solicitudes recientes y atajos al expediente.",
    bullets: [
      "Mira clientes, solicitudes en proceso, aprobadas y montos.",
      "Abre un expediente desde las tablas recientes.",
      "Envía un aviso rápido a un cliente.",
      "Revisa si WhatsApp y correo están conectados.",
    ],
  },
  "/admin/clientes": {
    href: "/admin/clientes",
    title: "Clientes",
    lead: "La lista maestra. Aquí abres el expediente de cada persona.",
    bullets: [
      "Busca por folio, nombre, correo o teléfono.",
      "Pulsa Expediente para ver datos, estudio, documentos y montos.",
      "En el expediente activas o desactivas el acceso del cliente.",
      "Ahí también preparas oferta, contrato y desembolso.",
    ],
  },
  "/admin/solicitudes": {
    href: "/admin/solicitudes",
    title: "Solicitudes",
    lead: "El flujo de cada crédito: de estudio a aprobación o rechazo.",
    bullets: [
      "Filtra por estado: estudio, documentos, en revisión o aprobada.",
      "Abre el expediente para pedir información, aprobar o rechazar.",
      "Lo que autorices aquí se refleja en la cuenta del cliente.",
    ],
  },
  "/admin/conversaciones": {
    href: "/admin/conversaciones",
    title: "Conversaciones",
    lead: "Historial de mensajes con el cliente, ligados a su expediente.",
    bullets: [
      "Revisa el hilo completo por cliente o teléfono.",
      "Los mensajes salientes y entrantes quedan registrados.",
      "Si WhatsApp no está conectado, aquí igual se guarda lo preparado.",
    ],
  },
  "/admin/whatsapp": {
    href: "/admin/whatsapp",
    title: "WhatsApp",
    lead: "Bandeja de WhatsApp Business: último mensaje y estado de envío.",
    bullets: [
      "Ve quién escribió y cuál fue el último mensaje.",
      "El estado (preparado, pendiente, enviado) aparece en cada hilo.",
      "Conecta el token en Configuración para envío real.",
    ],
  },
  "/admin/correos": {
    href: "/admin/correos",
    title: "Correos",
    lead: "Correos generados por el trámite: asunto, evento y estado.",
    bullets: [
      "Consulta qué se preparó para cada cliente.",
      "El estado queda en Preparado hasta que Gmail esté conectado.",
      "Úsalo para comprobar avisos de solicitud, documentos o contrato.",
    ],
  },
  "/admin/contratos": {
    href: "/admin/contratos",
    title: "Contratos",
    lead: "Prepara el contrato y da seguimiento a la firma del cliente.",
    bullets: [
      "Abre el expediente en la pestaña Contrato.",
      "Prepara el texto; el cliente lo firma en su cuenta.",
      "El estado pasa de borrador a preparado y luego a firma.",
    ],
  },
  "/admin/documentos": {
    href: "/admin/documentos",
    title: "Documentos",
    lead: "Todo lo que el cliente cargó: INE, domicilio, ingresos y más.",
    bullets: [
      "Abre el archivo y revisa que coincida con el expediente.",
      "Aprueba, rechaza o pide corrección desde el expediente.",
      "El cliente ve el resultado en su cuenta.",
    ],
  },
  "/admin/documentos-enviados": {
    href: "/admin/documentos-enviados",
    title: "Documentos enviados",
    lead: "PDF que genera la plataforma: contratos, ofertas y similares.",
    bullets: [
      "Consulta el archivo, quién lo generó y la fecha.",
      "El estado de envío queda registrado aquí.",
      "No se mezclan con los documentos que sube el cliente.",
    ],
  },
  "/admin/pagos": {
    href: "/admin/pagos",
    title: "Pagos y Fondos",
    lead: "Montos autorizados, mostrados al cliente y desembolsados.",
    bullets: [
      "Compara autorizado, mostrado y desembolsado por persona.",
      "Entra al expediente para ajustar el monto visible.",
      "El estado de desembolso se resume en esta tabla.",
    ],
  },
  "/admin/desembolsos": {
    href: "/admin/desembolsos",
    title: "Desembolsos",
    lead: "Cierra el crédito: confirma el desembolso para que el cliente lo vea.",
    bullets: [
      "Abre el registro y confirma el monto.",
      "Al registrarlo, aparece en la cuenta del cliente.",
      "Puedes cancelar un desembolso que aún no se confirma.",
    ],
  },
  "/admin/usuarios-cliente": {
    href: "/admin/usuarios-cliente",
    title: "Usuarios del cliente",
    lead: "Cuentas con las que el cliente entra al portal.",
    bullets: [
      "Revisa correo, estado y última actividad.",
      "Entra al expediente para activar, bloquear o restablecer acceso.",
      "El folio liga al usuario con su trámite.",
    ],
  },
  "/admin/sesiones": {
    href: "/admin/sesiones",
    title: "Sesiones",
    lead: "Quién está dentro ahora: IP, dispositivo y última página.",
    bullets: [
      "Mira sesiones activas de administradores y clientes.",
      "Sirve para saber si alguien quedó conectado.",
      "La bitácora guarda el detalle de cada entrada.",
    ],
  },
  "/admin/notificaciones": {
    href: "/admin/notificaciones",
    title: "Notificaciones",
    lead: "Avisos al cliente dentro de su cuenta (y correo si está conectado).",
    bullets: [
      "Elige cliente, tipo y escribe el mensaje.",
      "El aviso aparece en el portal del cliente.",
      "A la derecha ves si ya lo leyó.",
    ],
  },
  "/admin/reportes": {
    href: "/admin/reportes",
    title: "Reportes",
    lead: "Cifras tomadas de la base: clientes, montos, documentos y envíos.",
    bullets: [
      "Consulta el recuento de solicitudes y aprobaciones.",
      "Revisa montos autorizados y desembolsados.",
      "Úsalo para un vistazo rápido, no sustituye el expediente.",
    ],
  },
  "/admin/productos": {
    href: "/admin/productos",
    title: "Productos",
    lead: "Catálogo que el cliente ve al contratar: crédito, cuenta, ahorro.",
    bullets: [
      "Alta, edición y orden de productos.",
      "Desactivar oculta el producto; no borra contrataciones.",
      "En el expediente asignas productos a un cliente.",
    ],
  },
  "/admin/configuracion": {
    href: "/admin/configuracion",
    title: "Configuración",
    lead: "Conexiones del panel: Gmail, WhatsApp, archivos y base de datos.",
    bullets: [
      "Comprueba si Gmail y WhatsApp están listos.",
      "Los archivos viven en /uploads y se sirven con sesión.",
      "La base local es SQLite; hay PostgreSQL para producción.",
    ],
  },
  "/admin/usuarios": {
    href: "/admin/usuarios",
    title: "Equipo",
    lead: "Dueño, gerentes y asesores. El dueño da de alta al personal. Los clientes no van aquí.",
    bullets: [
      "Lista las cuentas con rol administrador.",
      "Los clientes se gestionan en Usuarios del cliente y en el expediente.",
      "El estado indica si la cuenta está activa.",
    ],
  },
  "/admin/bitacora": {
    href: "/admin/bitacora",
    title: "Bitácora",
    lead: "Registro de lo que ocurrió: logins, cambios y acciones sobre un cliente.",
    bullets: [
      "Solo lectura: no se edita desde aquí.",
      "Filtra con la vista: fecha, usuario, acción e IP.",
      "Sirve para saber quién hizo qué y cuándo.",
    ],
  },
};

export const ADMIN_WELCOME_GROUPS = [
  {
    label: "Operación",
    hrefs: [
      "/admin/clientes",
      "/admin/solicitudes",
      "/admin/documentos",
      "/admin/documentos-enviados",
      "/admin/contratos",
      "/admin/pagos",
      "/admin/desembolsos",
    ],
  },
  {
    label: "Comunicación",
    hrefs: ["/admin/conversaciones", "/admin/whatsapp", "/admin/correos", "/admin/notificaciones"],
  },
  {
    label: "Administración",
    hrefs: [
      "/admin/usuarios-cliente",
      "/admin/sesiones",
      "/admin/productos",
      "/admin/reportes",
      "/admin/configuracion",
      "/admin/usuarios",
      "/admin/bitacora",
    ],
  },
] as const;

export function sectionStorageKey(href: string) {
  return `${ADMIN_SECTION_KEY_PREFIX}${href}`;
}

export function matchAdminSection(pathname: string): AdminSectionCopy | null {
  if (!pathname.startsWith("/admin")) return null;
  if (pathname === "/admin") return ADMIN_SECTION_COPY["/admin"] ?? null;
  const hrefs = Object.keys(ADMIN_SECTION_COPY)
    .filter((href) => href !== "/admin" && (pathname === href || pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length);
  const href = hrefs[0];
  return href ? ADMIN_SECTION_COPY[href] ?? null : null;
}

export function clearAdminIntroSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_WELCOME_KEY);
  for (const item of ADMIN_NAV) {
    sessionStorage.removeItem(sectionStorageKey(item.href));
  }
}

export const BRAND = {
  name: "Conectemos",
  short: "Conectemos",
  legal: "S.A.P.I. de C.V., SOFOM, E.N.R.",
  legalFull: "Conectemos Junto Contigo, S.A.P.I. de C.V., SOFOM, E.N.R.",
  tagline: "Junto contigo.",
  email: "contacto@conectemos.mx",
  address: {
    street: "",
    colony: "",
    zip: "",
    alcaldia: "",
    city: "",
    between: "",
    reference: "",
  },
};

export function brandAddressLines() {
  const a = BRAND.address;
  return [
    a.street,
    [a.colony, a.zip].filter(Boolean).join(", "),
    [a.alcaldia, a.city].filter(Boolean).join(", "),
    a.between,
    a.reference ? `Referencia: ${a.reference}` : "",
  ].filter(Boolean);
}

export const DOCUMENT_TYPES = [
  { value: "IDENTIFICATION", label: "Identificación oficial (INE, pasaporte u otro documento oficial)" },
  { value: "ADDRESS_PROOF", label: "Comprobante de domicilio (no mayor a 3 meses de antigüedad)" },
  { value: "INCOME_PROOF", label: "Comprobante de ingresos o estados de cuenta" },
  { value: "BANK_STATEMENT", label: "Estado de cuenta" },
  { value: "CURP", label: "CURP" },
  { value: "TAX_STATUS", label: "Constancia de situación fiscal" },
  { value: "ADDITIONAL", label: "Documento adicional" },
] as const;

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  STUDY_PENDING: "Estudio pendiente",
  STUDY_COMPLETED: "Estudio completado",
  DOCUMENTS_PENDING: "Documentos pendientes",
  IN_REVIEW: "En revisión",
  INFO_REQUESTED: "Información solicitada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const DOCUMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibido",
  IN_REVIEW: "En revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  NEEDS_CORRECTION: "Requiere corrección",
};

export const USER_STATUS_LABEL: Record<string, string> = {
  PENDING_ACTIVATION: "Pendiente de activación",
  ACTIVE: "Activo",
  DISABLED: "Desactivado",
  BLOCKED: "Bloqueado",
};

export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  PREPARED: "Preparado",
  PENDING: "Pendiente de envío",
  SENT: "Enviado",
  ERROR: "Error",
};

export const DISBURSEMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARED: "Preparado",
  REGISTERED: "Registrado",
  CANCELLED: "Cancelado",
};

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  PREPARED: "Preparado",
  PENDING_SIGNATURE: "Pendiente de firma",
};

export const NOTIFICATION_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "SOLICITUD", label: "Solicitud" },
  { value: "DOCUMENTO", label: "Documento" },
  { value: "APROBACION", label: "Aprobación" },
  { value: "MONTO", label: "Monto" },
  { value: "CONTRATO", label: "Contrato" },
  { value: "DESEMBOLSO", label: "Desembolso" },
] as const;

export const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export type AdminNavItem = {
  href: string;
  label: string;
  hint: string;
  icon: string;
  countKey?: string;
};

export const ADMIN_NAV_GROUPS: { id: string; label: string; items: AdminNavItem[] }[] = [
  {
    id: "hoy",
    label: "Hoy",
    items: [{ href: "/admin", label: "Inicio", hint: "Resumen del día", icon: "⌂" }],
  },
  {
    id: "creditos",
    label: "Créditos",
    items: [
      { href: "/admin/clientes", label: "Expedientes", hint: "Personas que pidieron crédito", icon: "♙" },
      { href: "/admin/solicitudes", label: "Solicitudes", hint: "Trámites en curso", icon: "▣" },
      { href: "/admin/documentos", label: "Comprobantes", hint: "INE, domicilio e ingresos", icon: "▧", countKey: "documents" },
      { href: "/admin/desembolsos", label: "Desembolsos", hint: "Cuando se entrega el dinero", icon: "⌑" },
      { href: "/admin/pagos", label: "Pagos y fondos", hint: "Montos autorizados y mostrados", icon: "▣" },
      { href: "/admin/contratos", label: "Contratos", hint: "Preparar el contrato", icon: "▤" },
      { href: "/admin/documentos-enviados", label: "PDF generados", hint: "Archivos que arma el panel", icon: "▧", countKey: "sentDocs" },
    ],
  },
  {
    id: "comunicacion",
    label: "Hablar con el cliente",
    items: [
      { href: "/admin/notificaciones", label: "Avisos", hint: "Mensajes en su cuenta", icon: "♧" },
      { href: "/admin/conversaciones", label: "Conversaciones", hint: "Historial de chats", icon: "□", countKey: "conversations" },
      { href: "/admin/whatsapp", label: "WhatsApp", hint: "Mensajes de WhatsApp", icon: "◉", countKey: "whatsapp" },
      { href: "/admin/correos", label: "Correos", hint: "Correos del trámite", icon: "✉", countKey: "emails" },
    ],
  },
  {
    id: "equipo",
    label: "Equipo y sistema",
    items: [
      { href: "/admin/usuarios", label: "Equipo", hint: "Dueño, gerentes y asesores", icon: "♙" },
      { href: "/admin/usuarios-cliente", label: "Cuentas de clientes", hint: "Logins de quien pide crédito", icon: "♙" },
      { href: "/admin/productos", label: "Productos", hint: "Qué ofreces en el catálogo", icon: "▣" },
      { href: "/admin/reportes", label: "Reportes", hint: "Números del negocio", icon: "▥" },
      { href: "/admin/sesiones", label: "Sesiones", hint: "Quién está conectado", icon: "▧" },
      { href: "/admin/configuracion", label: "Configuración", hint: "Gmail, WhatsApp y marca", icon: "⚙" },
      { href: "/admin/bitacora", label: "Bitácora", hint: "Quién hizo qué y cuándo", icon: "▣" },
    ],
  },
];

export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const CLIENT_NAV_GROUPS = [
  { id: "tramite", label: "Trámite" },
  { id: "productos", label: "Productos" },
  { id: "cuenta", label: "Cuenta" },
] as const;

export const CLIENT_NAV = [
  { href: "/mi-cuenta", label: "Inicio", icon: "inicio", group: "tramite" },
  { href: "/mi-cuenta/solicitud", label: "Mi financiamiento", icon: "financiamiento", group: "tramite", needsSolicitud: true },
  { href: "/mi-cuenta/documentos", label: "Mis documentos", icon: "documentos", group: "tramite" },
  { href: "/mi-cuenta/valoracion", label: "Resultado y oferta", icon: "oferta", group: "tramite", needsSolicitud: true },
  { href: "/mi-cuenta/contrato", label: "Contrato", icon: "contrato", group: "tramite", needsAuth: true },
  { href: "/mi-cuenta/datos-bancarios", label: "Datos bancarios", icon: "banco", group: "tramite", needsAuth: true },
  { href: "/mi-cuenta/desembolso", label: "Desembolso", icon: "desembolso", group: "tramite", needsAuth: true },
  { href: "/mi-cuenta/productos", label: "Productos", icon: "productos", group: "productos" },
  { href: "/mi-cuenta/cuenta-digital", label: "Cuenta digital", icon: "cuenta", group: "productos", needsAuth: true },
  { href: "/mi-cuenta/ahorro", label: "Fondo de ahorro", icon: "ahorro", group: "productos", needsAuth: true },
  { href: "/mi-cuenta/inversiones", label: "Inversiones", icon: "inversiones", group: "productos", soon: true },
  { href: "/mi-cuenta/notificaciones", label: "Notificaciones", icon: "avisos", group: "cuenta", badge: true },
  { href: "/mi-cuenta/perfil", label: "Mi perfil", icon: "perfil", group: "cuenta" },
] as const;

export const CLIENT_MOBILE_NAV = [
  { href: "/mi-cuenta", label: "Inicio", icon: "inicio" },
  { href: "/mi-cuenta/productos", label: "Productos", icon: "productos" },
  { href: "/mi-cuenta/solicitud", label: "Trámite", icon: "financiamiento", needsSolicitud: true },
  { href: "/mi-cuenta/cuenta-digital", label: "Cuenta", icon: "cuenta", needsAuth: true },
  { href: "/mi-cuenta/notificaciones", label: "Avisos", icon: "avisos", badge: true },
  { href: "/mi-cuenta/perfil", label: "Perfil", icon: "perfil" },
] as const;

export const CLIENT_PRODUCT_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponible",
  CONTRACTED: "Contratado",
  PENDING: "Pendiente",
  BLOCKED: "No disponible",
  UNAVAILABLE: "No disponible",
  CANCELLED: "Cancelado",
};

export const SAVINGS_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  VALIDATING: "Comprobante en validación",
  VALIDATED: "Validado",
  PAID: "Pagado",
  REJECTED: "Requiere corrección",
};

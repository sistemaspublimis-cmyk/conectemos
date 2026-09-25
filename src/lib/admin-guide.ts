import type { AdminGuideStats } from "./admin-counts";

export type GuideStep = {
  id: string;
  n: string;
  title: string;
  where: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  actions: string[];
  pulse: (s: AdminGuideStats) => string;
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "buscar",
    n: "01",
    title: "Encuentra al cliente",
    where: "Barra de arriba",
    href: "/admin/clientes",
    cta: "Ir a Clientes",
    image: "/admin-guide/busqueda.png",
    imageAlt: "Barra para buscar cliente, folio, correo o teléfono",
    actions: [
      "Escribe folio, nombre, correo o teléfono en la barra de búsqueda.",
      "Enter abre la lista de clientes filtrada.",
    ],
    pulse: (s) => (s.clients === 1 ? "Hay 1 cliente en la base." : `Hay ${s.clients} clientes en la base.`),
  },
  {
    id: "clientes",
    n: "02",
    title: "Abre el expediente",
    where: "Menú → Clientes",
    href: "/admin/clientes",
    cta: "Abrir lista de clientes",
    image: "/admin-guide/clientes.png",
    imageAlt: "Tabla de clientes con folio y botón Expediente",
    actions: [
      "Entra a Clientes en el menú de la izquierda.",
      "Pulsa Expediente para ver datos, estudio, documentos y montos.",
    ],
    pulse: () => "Ahí se concentra todo el trámite de esa persona.",
  },
  {
    id: "solicitudes",
    n: "03",
    title: "Atiende la solicitud",
    where: "Menú → Solicitudes",
    href: "/admin/solicitudes",
    cta: "Ver solicitudes",
    image: "/admin-guide/solicitudes.png",
    imageAlt: "Tabla de solicitudes recientes con estatus",
    actions: [
      "Filtra por estado: estudio, documentos, en revisión o aprobada.",
      "Desde Expediente puedes pedir información, aprobar o rechazar.",
    ],
    pulse: (s) =>
      s.inProcess
        ? `Hoy tienes ${s.inProcess} solicitud${s.inProcess === 1 ? "" : "es"} en proceso.`
        : "No hay solicitudes en proceso. Las nuevas aparecen aquí.",
  },
  {
    id: "expediente",
    n: "04",
    title: "Opera el expediente",
    where: "Pestañas del cliente",
    href: "/admin/clientes",
    cta: "Abrir expedientes",
    image: "/admin-guide/expediente.png",
    imageAlt: "Expediente con pestañas de datos, oferta, contrato y desembolso",
    actions: [
      "Datos personales: activa, desactiva o restablece el acceso.",
      "Estudio y Documentos: revisa lo que el cliente cargó.",
      "Oferta, Contrato, Monto y Desembolso: autoriza y deja listo el crédito.",
    ],
    pulse: (s) =>
      s.approved
        ? `${s.approved} solicitud${s.approved === 1 ? "" : "es"} ya aprobada${s.approved === 1 ? "" : "s"}.`
        : "Cuando apruebes, el cliente ve oferta, contrato y desembolso.",
  },
  {
    id: "documentos",
    n: "05",
    title: "Revisa documentos",
    where: "Menú → Documentos",
    href: "/admin/documentos",
    cta: "Revisar documentos",
    image: "/admin-guide/documentos.png",
    imageAlt: "Pantalla de documentos recibidos",
    actions: [
      "Aprueba, rechaza o pide corrección desde el expediente.",
      "Documentos enviados guarda los PDF que genera la plataforma.",
    ],
    pulse: (s) =>
      s.docsPending
        ? `${s.docsPending} documento${s.docsPending === 1 ? "" : "s"} por revisar.`
        : "No hay documentos pendientes de revisión.",
  },
  {
    id: "cierre",
    n: "06",
    title: "Cierra el crédito",
    where: "Contrato y Desembolsos",
    href: "/admin/desembolsos",
    cta: "Ir a desembolsos",
    image: "/admin-guide/desembolsos.png",
    imageAlt: "Pantalla de desembolsos",
    actions: [
      "En Contrato, prepara el texto y el cliente lo firma en su cuenta.",
      "En Desembolsos, confirma el monto para que se vea en el portal.",
      "En Notificaciones avisas al cliente por el panel (y correo si está conectado).",
    ],
    pulse: (s) => {
      const bits = [];
      if (s.contractsOpen) bits.push(`${s.contractsOpen} contrato${s.contractsOpen === 1 ? "" : "s"} abierto${s.contractsOpen === 1 ? "" : "s"}`);
      if (s.disbursementsPending) bits.push(`${s.disbursementsPending} desembolso${s.disbursementsPending === 1 ? "" : "s"} por confirmar`);
      return bits.length ? bits.join(" · ") : "Cuando haya contrato o desembolso pendiente, se lista aquí.";
    },
  },
];

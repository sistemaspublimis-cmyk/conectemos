import type { ProductKind } from "@prisma/client";

export type CatalogSeed = {
  slug: string;
  name: string;
  kind: ProductKind;
  summary: string;
  description: string;
  benefits: string;
  requirements: string;
  imageUrl: string;
  requiresBasicAccount: boolean;
  sortOrder: number;
};

export type OfferGroup = "financiamiento" | "cuentas" | "patrimonio";

export type OfferFacts = {
  group: OfferGroup;
  audience: string;
  amount: string;
  term: string;
  purpose: string;
  nextSteps: string[];
};

export const OFFER_GROUPS: { id: OfferGroup; label: string; lead: string }[] = [
  {
    id: "financiamiento",
    label: "Financiamiento",
    lead: "Elige el que va con tu caso y pídelo. El pago y el plazo vienen en tu oferta.",
  },
  {
    id: "cuentas",
    label: "Cuentas y tarjetas",
    lead: "Ábrelas para usar tu crédito, tu tarjeta y la operación del negocio.",
  },
  {
    id: "patrimonio",
    label: "Ahorro e inversión",
    lead: "Súmalos cuando tu crédito ya está en marcha.",
  },
];

/** Créditos que nacen con la solicitud, no con un clic de contratación. */
export const CREDIT_ORIGINATION_SLUGS = [
  "credito-personal",
  "credito-nomina",
  "credito-pyme",
  "credito-automotriz",
  "arrendamiento-financiero",
  "factoraje",
] as const;

export function originatesWithApplication(slug: string) {
  return (CREDIT_ORIGINATION_SLUGS as readonly string[]).includes(slug);
}

export function solicitudHref(slug: string, extra?: { monto?: number; plazo?: number }) {
  const q = new URLSearchParams({ producto: slug });
  if (extra?.monto) q.set("monto", String(Math.round(extra.monto)));
  if (extra?.plazo) q.set("plazo", String(extra.plazo));
  return `/registro?${q.toString()}`;
}

export const CATALOG_SEED: CatalogSeed[] = [
  {
    slug: "cuenta-basica",
    name: "Cuenta básica",
    kind: "BASIC_ACCOUNT",
    summary: "El expediente con el que Conectemos te identifica antes de abrir otro producto.",
    description:
      "Aquí quedan tu nombre, tu folio y todo lo que contratas. Es el primer paso para pedir una tarjeta, la cuenta empresarial y el resto del catálogo. La abres desde tu portal en cuanto te registras.",
    benefits:
      "Folio e identidad en un solo expediente\nHistorial de productos contratados\nAcceso a tarjetas y cuenta empresarial\nConsulta desde el portal, también en el celular",
    requirements: "Registro con correo y teléfono\nExpediente en revisión o autorizado",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: false,
    sortOrder: 1,
  },
  {
    slug: "credito-personal",
    name: "Crédito personal",
    kind: "PERSONAL_CREDIT",
    summary: "Liquidez para un destino personal. Monto y plazo quedan escritos en tu oferta.",
    description:
      "Para salud, educación, reunir deudas, un imprevisto o un proyecto propio. Lo pides en línea, con tu identificación, domicilio e ingresos. Un asesor arma tu oferta con monto, plazo y pago, y el dinero entra a tu cuenta digital.",
    benefits:
      "Solicitud y seguimiento en el mismo portal\nPlazos de 6, 12, 18, 24, 36 o 48 meses\nOferta con monto, plazo y pago\nDesembolso a tu cuenta digital",
    requirements:
      "Edad de 20 a 60 años\nINE o pasaporte vigente\nRFC\nComprobante de domicilio no mayor a 3 meses\nComprobante de ingresos o estados de cuenta\nCLABE interbancaria\nEstudio socioeconómico completo",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 2,
  },
  {
    slug: "credito-nomina",
    name: "Crédito de nómina",
    kind: "PAYROLL_CREDIT",
    summary: "Para quien comprueba su ingreso con recibos de nómina y antigüedad en el empleo.",
    description:
      "Para quien cobra por nómina. Declaras el destino, enseñas tus recibos y eliges si el pago va con tu patrón o lo cubres directo. Con identificación, domicilio e ingresos ya puedes pedirlo.",
    benefits:
      "Monto ligado a un ingreso recurrente y comprobable\nPlazo de 6 a 36 meses, definido en la oferta\nMismo expediente de estudio, documentos y contrato\nAviso en el portal cuando cambia el estado",
    requirements:
      "Edad de 20 a 60 años\nAl menos 6 meses de antigüedad en el empleo\nRecibos de nómina recientes o constancia del patrón\nIdentificación oficial vigente\nComprobante de domicilio no mayor a 3 meses\nCLABE interbancaria",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 3,
  },
  {
    slug: "credito-pyme",
    name: "Crédito PyME",
    kind: "SME_CREDIT",
    summary: "Capital de trabajo para la operación de tu negocio.",
    description:
      "Para persona física con actividad empresarial o persona moral que necesita inventario, proveedores, renta o el ciclo de venta. Llegas con tu constancia fiscal y tus estados de cuenta, y te armamos monto y plazo. Si el destino es un auto o maquinaria, también está el crédito automotriz y el arrendamiento.",
    benefits:
      "Monto para el ciclo del negocio, no solo para gasto personal\nRevisión de actividad económica y estados de cuenta\nOferta por escrito antes del contrato\nSeguimiento del expediente en el portal",
    requirements:
      "Persona física con actividad empresarial o persona moral\nConstancia de situación fiscal\nIdentificación del titular o representante\nComprobante de domicilio del negocio o del titular\nEstados de cuenta recientes de la actividad\nEstudio del expediente",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 4,
  },
  {
    slug: "credito-automotriz",
    name: "Crédito automotriz",
    kind: "AUTO_CREDIT",
    summary: "Financiamiento para comprar un auto nuevo o seminuevo.",
    description:
      "Financia la compra de un auto nuevo o seminuevo de hasta 7 años. Llegas con la cotización o la factura y armamos enganche, monto y plazo. Si prefieres usar el auto y comprar al final, mira el arrendamiento.",
    benefits:
      "Plazo de 12 a 60 meses\nRevisión con cotización o factura en el expediente\nOferta con enganche, monto y plazo\nPara quien quiere comprar el auto",
    requirements:
      "Edad de 18 a 70 años\nIdentificación oficial vigente\nComprobante de ingresos\nComprobante de domicilio no mayor a 3 meses\nCotización o factura del vehículo\nEnganche según el resultado del estudio",
    imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 5,
  },
  {
    slug: "arrendamiento-financiero",
    name: "Arrendamiento financiero",
    kind: "LEASING",
    summary: "Usas un auto o equipo y decides la compra al terminar el plazo.",
    description:
      "Para persona física con actividad empresarial o persona moral. Durante el plazo usas el auto o el equipo; la opción de compra queda escrita en el contrato y se ejerce al vencimiento, si así lo decides. Conviene cuando el bien es herramienta de trabajo y prefieres no desembolsar el valor completo al inicio. El plazo habitual va de 12 a 48 meses.",
    benefits:
      "El auto o el equipo trabaja mientras pagas el plazo\nOpción de compra descrita en el contrato\nPlazo de 12 a 48 meses\nEstudio de la actividad económica, no solo del ingreso personal",
    requirements:
      "Persona física con actividad empresarial o persona moral\nConstancia de situación fiscal\nIdentificación del titular o representante\nCotización del auto o del equipo\nEstados de cuenta de la actividad\nComprobante de domicilio",
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 6,
  },
  {
    slug: "factoraje",
    name: "Factoraje",
    kind: "FACTORING",
    summary: "Anticipo sobre facturas de clientes que todavía no te pagan.",
    description:
      "Adelantas facturas de ventas que ya hiciste y tu cliente paga a 30, 60 o 90 días. Recibes un anticipo hoy y el resto cuando cobran, menos la contraprestación de tu oferta. Así sigues pagando nómina, proveedores y producción.",
    benefits:
      "Anticipo sin esperar el vencimiento de tu cliente\nCada operación se revisa con su factura\nLa contraprestación queda en la oferta\nÚtil en ciclos de 30, 60 o 90 días",
    requirements:
      "Persona moral o persona física con actividad empresarial\nFacturas vigentes de una venta ya realizada\nRelación de clientes y plazos de pago\nConstancia de situación fiscal\nEstados de cuenta de la empresa\nIdentificación del representante",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 7,
  },
  {
    slug: "tarjeta-credito",
    name: "Tarjeta de crédito",
    kind: "CREDIT_CARD",
    summary: "Línea revolvente para compras. El límite se asigna en tu expediente.",
    description:
      "Una línea para tus compras, que se restaura conforme la vas cubriendo. El límite y la fecha de corte vienen en tu oferta. La pides con tu cuenta básica.",
    benefits:
      "Límite definido por escrito en la oferta\nConsulta del estatus en el portal\nSeparada del crédito de una sola disposición\nSe pide con cuenta básica activa",
    requirements: "Cuenta básica contratada\nIdentificación y comprobantes del expediente\nAutorización de la línea",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 8,
  },
  {
    slug: "tarjeta-empresarial",
    name: "Tarjeta empresarial",
    kind: "CREDIT_CARD",
    summary: "Línea para compras y gastos de la operación, separada de la personal.",
    description:
      "Concentra el gasto del negocio en una línea distinta a la personal. El límite lo asigna Conectemos después de revisar la actividad económica. Requiere cuenta básica. Si ya operas como empresa, la cuenta empresarial evita mezclar en el expediente el gasto personal y el del negocio.",
    benefits:
      "Gastos de operación separados del gasto personal\nLímite y condiciones en la oferta\nSeguimiento en el mismo portal\nSe solicita con cuenta básica activa",
    requirements:
      "Cuenta básica contratada\nConstancia de situación fiscal o comprobante de actividad\nAutorización de la línea",
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 9,
  },
  {
    slug: "tarjeta-debito",
    name: "Tarjeta de débito",
    kind: "DEBIT_CARD",
    summary: "Medio para disponer recursos ya ligados a tu cuenta básica.",
    description:
      "Para disponer de los recursos de tu cuenta básica y consultarlos en el portal. La pides cuando esa cuenta ya está abierta.",
    benefits: "Asociada a tu cuenta básica\nConsulta en el portal\nLista para disponer",
    requirements: "Cuenta básica contratada",
    imageUrl: "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 10,
  },
  {
    slug: "cuenta-empresarial",
    name: "Cuenta empresarial",
    kind: "BUSINESS_ACCOUNT",
    summary: "El expediente de tu actividad económica, separado del personal.",
    description:
      "Ordena la operación del negocio. Capital de trabajo, tarjeta empresarial y documentos de la actividad viven aquí. Se abre después de la cuenta básica, con tu constancia fiscal y un comprobante de la actividad.",
    benefits:
      "Documentos de la actividad en un solo lugar\nBase para crédito PyME, arrendamiento y tarjeta empresarial\nSeguimiento distinto al expediente personal",
    requirements: "Cuenta básica contratada\nConstancia de situación fiscal\nComprobante de domicilio de la actividad",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 11,
  },
  {
    slug: "cuenta-digital",
    name: "Cuenta digital",
    kind: "DIGITAL_ACCOUNT",
    summary: "Cuenta del expediente para recibir el financiamiento ya autorizado.",
    description:
      "Cuando tu crédito queda listo, aquí ves el folio, el monto y el desembolso. Es la cuenta donde recibes el financiamiento.",
    benefits: "Recepción del monto autorizado\nConsulta de folio y desembolso\nAviso en el portal cuando queda lista",
    requirements: "Crédito autorizado en tu expediente",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 12,
  },
  {
    slug: "fondo-ahorro",
    name: "Fondo de ahorro",
    kind: "SAVINGS",
    summary: "Aportación ligada a tu crédito autorizado, con referencia de pago.",
    description:
      "Con tu crédito en marcha, el portal te da la referencia y el monto de tu fondo de ahorro. Subes el comprobante y sigues el estatus desde tu cuenta.",
    benefits: "Referencia de pago visible en el portal\nCarga del comprobante desde tu cuenta\nEstatus de la aportación en el expediente",
    requirements: "Crédito autorizado\nComprobante por el monto indicado en el expediente",
    imageUrl: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 13,
  },
  {
    slug: "inversiones",
    name: "Inversiones",
    kind: "INVESTMENT",
    summary: "Tres perfiles que se habilitan dentro de tu expediente.",
    description:
      "Cuando Conectemos activa inversiones en tu cuenta puedes revisar tres perfiles: conservador, equilibrio y crecimiento. El horizonte y las condiciones se confirman en ese momento, dentro del expediente. Hace falta cuenta básica y que el producto esté habilitado para ti. Mientras no esté activo, el portal muestra los perfiles para que veas cómo están armados.",
    benefits:
      "Perfil conservador para un horizonte corto\nPerfil de equilibrio para un horizonte medio\nPerfil de crecimiento para un horizonte largo\nCondiciones visibles en el expediente al habilitarse",
    requirements: "Cuenta básica contratada\nProducto habilitado en tu expediente",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
    requiresBasicAccount: true,
    sortOrder: 14,
  },
];

export const OFFER_FACTS: Record<string, OfferFacts> = {
  "cuenta-basica": {
    group: "cuentas",
    audience: "Cualquier persona que abre expediente en Conectemos",
    amount: "Sin línea de crédito",
    term: "Vigente mientras tu expediente esté activo",
    purpose: "Identificarte y habilitar el resto de productos",
    nextSteps: [
      "Creas tu cuenta con correo y teléfono.",
      "Tu folio queda asignado y el expediente entra en revisión.",
      "Con la cuenta básica activa ya puedes pedir tarjetas y cuenta empresarial.",
    ],
  },
  "credito-personal": {
    group: "financiamiento",
    audience: "Personas físicas de 20 a 60 años con ingresos comprobables",
    amount: "$50,000 a $1,000,000",
    term: "6 a 48 meses",
    purpose: "Salud, educación, deudas, imprevistos o un proyecto personal",
    nextSteps: [
      "Registras tu cuenta y eliges continuar la solicitud.",
      "Completas el estudio y cargas identificación, domicilio e ingresos.",
      "Un asesor revisa el expediente. Monto, plazo, tasa y CAT quedan en la oferta.",
    ],
  },
  "credito-nomina": {
    group: "financiamiento",
    audience: "Empleados con nómina comprobable y al menos 6 meses de antigüedad",
    amount: "$50,000 a $500,000",
    term: "6 a 36 meses",
    purpose: "Liquidez personal respaldada por un sueldo recurrente",
    nextSteps: [
      "Declaras el destino y tu empleo en el estudio.",
      "Cargas recibos de nómina o la constancia del patrón, más tu identificación y domicilio.",
      "La oferta indica si el pago es directo o conviene con el patrón.",
    ],
  },
  "credito-pyme": {
    group: "financiamiento",
    audience: "Persona física con actividad empresarial o persona moral",
    amount: "$200,000 a $10,000,000",
    term: "6 a 36 meses",
    purpose: "Inventario, proveedores, renta y el ciclo de operación",
    nextSteps: [
      "Abres el expediente y describes la actividad.",
      "Cargas constancia fiscal, estados de cuenta y domicilio.",
      "La oferta fija monto y plazo según la operación, no solo según un ingreso personal.",
    ],
  },
  "credito-automotriz": {
    group: "financiamiento",
    audience: "Persona física que va a comprar un auto nuevo o seminuevo",
    amount: "$50,000 a $2,000,000",
    term: "12 a 60 meses",
    purpose: "Compra de auto nuevo o seminuevo de hasta 7 años",
    nextSteps: [
      "Subes la cotización o la factura junto con tu identificación e ingresos.",
      "El estudio define enganche, monto y plazo.",
      "Firmas la oferta. El crédito paga la compra; no es un arrendamiento.",
    ],
  },
  "arrendamiento-financiero": {
    group: "financiamiento",
    audience: "Persona física con actividad empresarial o persona moral",
    amount: "$100,000 a $10,000,000",
    term: "12 a 48 meses",
    purpose: "Usar un auto o equipo y, si quieres, comprarlo al vencer el plazo",
    nextSteps: [
      "Presentas la cotización del bien y los documentos de la actividad.",
      "El contrato describe las rentas y la opción de compra.",
      "Al vencimiento decides si ejerces esa opción, en las condiciones ya escritas.",
    ],
  },
  factoraje: {
    group: "financiamiento",
    audience: "Empresas que facturan a 30, 60 o 90 días",
    amount: "$50,000 a $10,000,000",
    term: "El vencimiento de la factura",
    purpose: "Adelantar cuentas por cobrar de una venta ya realizada",
    nextSteps: [
      "Integras facturas vigentes, clientes y estados de cuenta.",
      "Conectemos revisa cada factura antes de anticipar.",
      "La oferta detalla el anticipo y la contraprestación. El resto se liquida al cobro.",
    ],
  },
  "tarjeta-credito": {
    group: "cuentas",
    audience: "Personas físicas con cuenta básica",
    amount: "Límite asignado en tu expediente",
    term: "Línea revolvente",
    purpose: "Compras y disposiciones cotidianas",
    nextSteps: [
      "Contrata primero la cuenta básica.",
      "Solicita la línea desde tu portal.",
      "El límite, la tasa y la fecha de corte se confirman en la autorización.",
    ],
  },
  "tarjeta-empresarial": {
    group: "cuentas",
    audience: "Persona física con actividad empresarial o persona moral",
    amount: "Límite según la actividad",
    term: "Línea revolvente",
    purpose: "Compras y gastos de la operación",
    nextSteps: [
      "Ten la cuenta básica activa y, si ya operas, la cuenta empresarial.",
      "Carga la constancia fiscal o el comprobante de actividad.",
      "Conectemos asigna el límite en la oferta, separado de una tarjeta personal.",
    ],
  },
  "tarjeta-debito": {
    group: "cuentas",
    audience: "Clientes con cuenta básica contratada",
    amount: "Los recursos de tu cuenta",
    term: "Mientras la cuenta básica siga activa",
    purpose: "Disponer y consultar, sin abrir crédito nuevo",
    nextSteps: [
      "Contrata la cuenta básica.",
      "Pide la tarjeta de débito en productos.",
      "La disposición queda ligada a esa cuenta, no a una línea revolvente.",
    ],
  },
  "cuenta-empresarial": {
    group: "cuentas",
    audience: "Persona física con actividad empresarial o persona moral",
    amount: "Para operar tu negocio",
    term: "Mientras el expediente empresarial esté activo",
    purpose: "Separar documentos y productos del negocio",
    nextSteps: [
      "Contrata la cuenta básica.",
      "Carga constancia fiscal y domicilio de la actividad.",
      "Desde ahí puedes seguir crédito PyME, arrendamiento y tarjeta empresarial.",
    ],
  },
  "cuenta-digital": {
    group: "cuentas",
    audience: "Clientes con crédito autorizado",
    amount: "El monto autorizado de tu crédito",
    term: "Desde la autorización hasta el desembolso",
    purpose: "Recibir el financiamiento y consultar folio y estatus",
    nextSteps: [
      "Termina estudio y documentos.",
      "Espera la autorización en tu portal.",
      "Ahí ves tu folio, tu monto y el desembolso.",
    ],
  },
  "fondo-ahorro": {
    group: "patrimonio",
    audience: "Clientes con crédito autorizado",
    amount: "El que fija tu oferta",
    term: "El de tu crédito",
    purpose: "Aportar el fondo ligado al financiamiento",
    nextSteps: [
      "El crédito tiene que estar autorizado.",
      "El portal muestra referencia y monto.",
      "Cargas el comprobante por ese monto y sigues el estatus.",
    ],
  },
  inversiones: {
    group: "patrimonio",
    audience: "Clientes con cuenta básica y el producto habilitado",
    amount: "Según el perfil que se active",
    term: "Corto, medio o largo, según el perfil",
    purpose: "Conservar, equilibrar o buscar crecimiento",
    nextSteps: [
      "Revisa los tres perfiles en tu portal.",
      "El producto tiene que estar habilitado en tu expediente.",
      "Ahí ves el horizonte y las condiciones de tu perfil.",
    ],
  },
};

export function catalogBySlug(slug: string) {
  return CATALOG_SEED.find((item) => item.slug === slug);
}

export function offerFacts(slug: string) {
  return OFFER_FACTS[slug];
}

export function productsInGroup(group: OfferGroup) {
  return CATALOG_SEED.filter((item) => OFFER_FACTS[item.slug]?.group === group);
}

export function catalogLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  BASIC_ACCOUNT: "Cuenta básica",
  DIGITAL_ACCOUNT: "Cuenta digital",
  PERSONAL_CREDIT: "Crédito personal",
  PAYROLL_CREDIT: "Crédito de nómina",
  SME_CREDIT: "Crédito PyME",
  AUTO_CREDIT: "Crédito automotriz",
  LEASING: "Arrendamiento",
  FACTORING: "Factoraje",
  CREDIT_CARD: "Tarjeta de crédito",
  DEBIT_CARD: "Tarjeta de débito",
  BUSINESS_ACCOUNT: "Cuenta empresarial",
  SAVINGS: "Fondo de ahorro",
  INVESTMENT: "Inversiones",
};

export const PRODUCT_KINDS = Object.keys(PRODUCT_KIND_LABEL) as ProductKind[];

export const CLIENT_PRODUCT_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponible",
  CONTRACTED: "Contratado",
  PENDING: "Pendiente",
  BLOCKED: "Bloqueado",
  UNAVAILABLE: "No disponible",
  CANCELLED: "Cancelado",
};

import { formatMXN } from "./money";

export const DEFAULT_CONTRACT_TEMPLATE = `CONTRATO DE CRÉDITO SIMPLE
Conectemos Junto Contigo, S.A.P.I. de C.V., SOFOM, E.N.R.

Folio: {{solicitud.folio}}
Fecha: {{fecha}}

COMPARECEN

I. CONECTEMOS JUNTO CONTIGO, S.A.P.I. DE C.V., SOFOM, E.N.R., en lo sucesivo "la Financiera".

II. {{cliente.nombre}}, con correo {{cliente.email}} y teléfono {{cliente.telefono}}, en lo sucesivo "el Cliente".

CLÁUSULAS

PRIMERA. Objeto. La Financiera y el Cliente celebran el presente contrato de crédito simple, expediente {{solicitud.folio}}.

SEGUNDA. Monto. El monto del crédito es {{solicitud.monto}}.

TERCERA. Plazo. El plazo es {{solicitud.plazo}}.

CUARTA. Producto. Producto contratado: {{solicitud.producto}}.

QUINTA. Domicilio y datos. El Cliente manifiesta que los datos de su expediente son:
- Nombre: {{cliente.nombre}}
- Correo: {{cliente.email}}
- Teléfono: {{cliente.telefono}}
- Folio: {{solicitud.folio}}

SEXTA. Disposición. El desembolso se realiza conforme a las condiciones autorizadas en el expediente.

SÉPTIMA. Firma. El Cliente firma el presente contrato en el portal de Conectemos.

En {{fecha}}.

_______________________________
La Financiera

_______________________________
{{cliente.nombre}}
`;

export type ContractVars = Record<string, string>;

export function contractVarsFromClient(client: {
  folio: string;
  product?: string | null;
  requestedAmount: unknown;
  termMonths?: number | null;
  user: { firstName: string; lastName: string; email: string; phone?: string | null };
}): ContractVars {
  const name = `${client.user.firstName} ${client.user.lastName}`.trim();
  const today = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return {
    "{{cliente.nombre}}": name || "—",
    "{{cliente.email}}": client.user.email,
    "{{cliente.telefono}}": client.user.phone || "—",
    "{{solicitud.folio}}": client.folio,
    "{{solicitud.monto}}": formatMXN(client.requestedAmount),
    "{{solicitud.plazo}}": client.termMonths ? `${client.termMonths} meses` : "—",
    "{{solicitud.producto}}": client.product || "Crédito Personal",
    "{{fecha}}": today,
  };
}

export function fillContractTemplate(template: string, vars: ContractVars) {
  let body = template;
  for (const [key, value] of Object.entries(vars)) {
    body = body.split(key).join(value);
  }
  return body;
}

export function contractFileName(firstName: string, lastName: string) {
  const slug = `${firstName}_${lastName}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_|_$/g, "");
  return `Contrato_Conectemos_${slug || "Cliente"}.pdf`;
}

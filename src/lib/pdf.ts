import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { formatMXN } from "./money";
import { APPLICATION_STATUS_LABEL } from "./constants";
import { DEFAULT_CONTRACT_TEMPLATE, contractFileName, contractVarsFromClient, fillContractTemplate } from "./contract-template";

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");

export type PdfKind =
  | "solicitud"
  | "estudio"
  | "resumen-aprobacion"
  | "oferta"
  | "contrato"
  | "comprobante"
  | "estado-cuenta";

export async function generateClientPdf(clientId: string, kind: PdfKind, generatedById?: string, downloadName?: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: true,
      application: true,
      study: true,
      bankDetails: true,
      offer: true,
      contract: true,
      disbursement: true,
    },
  });
  if (!client) throw new Error("Cliente no encontrado");

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 750;
  const green = rgb(0.03, 0.44, 0.6);

  const write = (text: string, opts?: { size?: number; b?: boolean; color?: ReturnType<typeof rgb> }) => {
    const size = opts?.size || 11;
    if (y < 60) {
      page = pdf.addPage([612, 792]);
      y = 750;
    }
    const f = opts?.b ? bold : font;
    const lines = wrap(text, 90);
    for (const line of lines) {
      page.drawText(line, { x: 50, y, size, font: f, color: opts?.color || rgb(0.1, 0.12, 0.12) });
      y -= size + 4;
    }
  };

  const name = `${client.user.firstName} ${client.user.lastName}`.trim();
  const today = new Date().toLocaleString("es-MX");
  write("Conectemos", { size: 16, b: true, color: green });
  write("S.A.P.I. de C.V., SOFOM, E.N.R.", { size: 9 });
  y -= 8;
  write(titleFor(kind), { size: 14, b: true });
  write(`Folio: ${client.folio}`);
  write(`Fecha: ${today}`);
  y -= 10;

  const vars = contractVarsFromClient(client);

  if (kind === "estudio" && client.study) {
    const s = client.study;
    write(`Nombre: ${s.fullName || name}`);
    write(`Fecha de nacimiento: ${s.birthDate || "-"}`);
    write(`Estado civil: ${s.maritalStatus || "-"}`);
    write(`Dependientes: ${s.dependents ?? "-"}`);
    write(`Domicilio: ${s.address || "-"}`);
    write(`Tipo de vivienda: ${s.housingType || "-"}`);
    write(`Empleo: ${s.employmentType || "-"} / ${s.company || "-"} / ${s.position || "-"}`);
    write(`Antiguedad: ${s.seniority || "-"}`);
    write(`Ingreso mensual: ${formatMXN(s.monthlyIncome)}`);
    write(`Otros ingresos: ${formatMXN(s.otherIncome)}`);
    write(`Gastos vivienda: ${formatMXN(s.housingExpense)}`);
    write(`Alimentacion: ${formatMXN(s.foodExpense)}`);
    write(`Servicios: ${formatMXN(s.utilitiesExpense)}`);
    write(`Transporte: ${formatMXN(s.transportExpense)}`);
    write(`Creditos: ${formatMXN(s.creditExpense)}`);
    write(`Otros: ${formatMXN(s.otherExpense)}`);
    write(`Creditos actuales: ${s.currentCredits || "-"}`);
    write(`Deudas: ${s.debts || "-"}`);
    write(`Referencias: ${s.references || "-"}`);
    write(`Monto solicitado: ${formatMXN(s.requestedAmount)}`);
    write(`Plazo: ${s.termMonths ?? "-"} meses`);
    write(`Motivo: ${s.purpose || "-"}`);
  } else if (kind === "contrato") {
    const template = client.contract?.body || DEFAULT_CONTRACT_TEMPLATE;
    const body = fillContractTemplate(template, vars);
    for (const line of body.split("\n")) write(line || " ");
    y -= 6;
    write("Contrato generado con los datos del expediente.", { color: rgb(0.03, 0.44, 0.6) });
  } else {
    write(`Cliente: ${name}`);
    write(`Correo: ${client.user.email}`);
    write(`Telefono: ${client.user.phone || "-"}`);
    write(`Producto: ${client.product}`);
    write(`Monto solicitado: ${formatMXN(client.requestedAmount)}`);
    write(`Monto autorizado: ${formatMXN(client.authorizedAmount)}`);
    write(`Monto mostrado: ${formatMXN(client.displayedAmount)}`);
    write(`Monto desembolsado (registro): ${formatMXN(client.disbursedAmount)}`);
    if (client.application) write(`Estado de solicitud: ${APPLICATION_STATUS_LABEL[client.application.status]}`);
    if (kind === "oferta") {
      write(`Oferta: ${client.offer ? formatMXN(client.offer.amount) : "Pendiente de completar."}`);
      write(`Estatus oferta: ${client.offer?.status === "PREPARED" ? "Preparada" : "Pendiente"}`);
    }
    if (kind === "estado-cuenta") {
      write("Estado de cuenta de tu financiamiento con Conectemos.");
      write(`Saldo mostrado al cliente: ${formatMXN(client.displayedAmount)}`);
    }
    if (kind === "comprobante") {
      const d = client.disbursement;
      write(`Desembolso: ${d ? d.status : "Pendiente"}`);
      write(`Monto registrado: ${formatMXN(d?.amount ?? 0)}`);
      if (d?.status !== "REGISTERED") write("No existe un desembolso registrado.", { color: rgb(0.7, 0.3, 0.3) });
    }
  }

  y -= 16;
  write("Documento generado por la plataforma Conectemos. Plantilla con variables del expediente.", { size: 8 });

  const bytes = await pdf.save();
  await mkdir(uploadDir, { recursive: true });
  const storedName = `${randomUUID()}.pdf`;
  await writeFile(path.join(uploadDir, storedName), Buffer.from(bytes));
  const fileName =
    downloadName ||
    (kind === "contrato" ? contractFileName(client.user.firstName, client.user.lastName) : `${kind}-${client.folio}.pdf`);
  const row = await prisma.generatedDocument.create({
    data: {
      clientId: client.id,
      type: kind,
      fileName,
      storedName,
      status: "PREPARED",
      generatedById: generatedById || null,
    },
  });
  return { row, fileName };
}

function wrap(text: string, max: number) {
  const words = String(text).split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [" "];
}

function titleFor(kind: PdfKind) {
  switch (kind) {
    case "solicitud":
      return "Solicitud de financiamiento";
    case "estudio":
      return "Estudio socioeconomico";
    case "resumen-aprobacion":
      return "Resumen de aprobacion";
    case "oferta":
      return "Oferta";
    case "contrato":
      return "Contrato";
    case "comprobante":
      return "Comprobante";
    case "estado-cuenta":
      return "Estado de cuenta (registro)";
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { queueEmail } from "@/lib/email";
import { createNotification } from "@/lib/notify";

function num(v: FormDataEntryValue | null) {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const client = await prisma.client.findUnique({ where: { userId: ctx.user.id } });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });
  const existing = await prisma.socioEconomicStudy.findUnique({ where: { clientId: client.id } });
  if (existing?.submitted) {
    return NextResponse.json({ error: "El estudio ya fue enviado y no se puede modificar." }, { status: 409 });
  }
  const fd = await req.formData();
  const submit = String(fd.get("submit") || "") === "1";
  const monthlyExpenses = num(fd.get("monthlyExpenses"));

  const data = {
    fullName: String(fd.get("fullName") || ""),
    birthDate: String(fd.get("birthDate") || ""),
    maritalStatus: String(fd.get("maritalStatus") || ""),
    dependents: num(fd.get("dependents")) != null ? Math.round(num(fd.get("dependents"))!) : null,
    address: String(fd.get("address") || ""),
    neighborhood: String(fd.get("neighborhood") || ""),
    city: String(fd.get("city") || ""),
    state: String(fd.get("state") || ""),
    zip: String(fd.get("zip") || ""),
    housingType: String(fd.get("housingType") || ""),
    employmentType: String(fd.get("employmentType") || ""),
    company: String(fd.get("company") || ""),
    position: String(fd.get("position") || ""),
    seniority: String(fd.get("seniority") || ""),
    monthlyIncome: num(fd.get("monthlyIncome")),
    otherIncome: num(fd.get("otherIncome")),
    monthlyExpenses,
    housingExpense: monthlyExpenses ?? num(fd.get("housingExpense")),
    foodExpense: monthlyExpenses != null ? 0 : num(fd.get("foodExpense")),
    utilitiesExpense: monthlyExpenses != null ? 0 : num(fd.get("utilitiesExpense")),
    transportExpense: monthlyExpenses != null ? 0 : num(fd.get("transportExpense")),
    creditExpense: num(fd.get("creditExpense")),
    otherExpense: num(fd.get("otherExpense")),
    currentCredits: String(fd.get("currentCredits") || ""),
    autoCredits: String(fd.get("autoCredits") || ""),
    knowsBureau: String(fd.get("knowsBureau") || ""),
    bureauStatus: String(fd.get("bureauStatus") || ""),
    debts: String(fd.get("debts") || ""),
    references: String(fd.get("references") || ""),
    requestedAmount: num(fd.get("requestedAmount")),
    termMonths: num(fd.get("termMonths")) != null ? Math.round(num(fd.get("termMonths"))!) : null,
    purpose: String(fd.get("purpose") || ""),
    submitted: submit,
    submittedAt: submit ? new Date() : undefined,
  };

  await prisma.socioEconomicStudy.upsert({
    where: { clientId: client.id },
    create: { clientId: client.id, ...data },
    update: data,
  });

  if (data.requestedAmount != null) {
    await prisma.client.update({
      where: { id: client.id },
      data: {
        requestedAmount: data.requestedAmount,
        termMonths: data.termMonths,
        purpose: data.purpose,
      },
    });
    await prisma.application.update({
      where: { clientId: client.id },
      data: {
        amount: data.requestedAmount,
        termMonths: data.termMonths,
        purpose: data.purpose,
        status: submit ? "DOCUMENTS_PENDING" : undefined,
      },
    });
  } else if (submit) {
    await prisma.application.update({
      where: { clientId: client.id },
      data: { status: "DOCUMENTS_PENDING" },
    });
  }

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: client.id,
    action: submit ? "STUDY_SUBMITTED" : "STUDY_SAVED",
    ip: meta.ip,
  });

  if (submit) {
    await queueEmail({
      clientId: client.id,
      eventType: "SOLICITUD_RECIBIDA",
      toEmail: ctx.user.email,
      subject: `Estudio recibido · ${client.folio}`,
      body: "Recibimos tu estudio socioeconómico. Continúa con la carga de documentos.",
    });
    await createNotification({
      clientId: client.id,
      type: "SOLICITUD",
      title: "Estudio recibido",
      message: "Tu estudio socioeconómico fue guardado. Sube tus documentos.",
      channelPanel: true,
    });
  }

  return NextResponse.json({ ok: true, submitted: submit });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ctx = await requireUser();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (ctx.user.role !== "CLIENT") {
    return NextResponse.json({ role: "ADMIN", name: `${ctx.user.firstName} ${ctx.user.lastName}` });
  }
  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true, bankDetails: true },
  });
  return NextResponse.json({
    role: "CLIENT",
    applicationStatus: client?.application?.status,
    bank: client?.bankDetails
      ? {
          holder: client.bankDetails.holder || "",
          bank: client.bankDetails.bank || "",
          clabe: client.bankDetails.clabe || "",
          accountNumber: client.bankDetails.accountNumber || "",
          branch: client.bankDetails.branch || "",
          accountType: client.bankDetails.accountType || "",
        }
      : {},
  });
}

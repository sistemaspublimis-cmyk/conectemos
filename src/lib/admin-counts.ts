import { prisma } from "./prisma";

export async function adminCounts() {
  const [conversations, emails, documents, sentDocs, whatsapp] = await Promise.all([
    prisma.conversation.count(),
    prisma.emailMessage.count({ where: { status: { in: ["PREPARED", "PENDING", "ERROR"] } } }),
    prisma.clientDocument.count(),
    prisma.generatedDocument.count(),
    prisma.whatsAppMessage.count({ where: { status: { in: ["PREPARED", "PENDING"] } } }),
  ]);
  return { conversations, emails, documents, sentDocs, whatsapp };
}

export async function dashboardStats() {
  const [clients, inProcess, approved, authorized, disbursed] = await Promise.all([
    prisma.client.count(),
    prisma.application.count({
      where: { status: { in: ["STUDY_PENDING", "STUDY_COMPLETED", "DOCUMENTS_PENDING", "IN_REVIEW", "INFO_REQUESTED"] } },
    }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.client.aggregate({ _sum: { authorizedAmount: true } }),
    prisma.client.aggregate({ _sum: { disbursedAmount: true } }),
  ]);
  return {
    clients,
    inProcess,
    approved,
    authorized: Number(authorized._sum.authorizedAmount || 0),
    disbursed: Number(disbursed._sum.disbursedAmount || 0),
  };
}

export async function adminGuideStats() {
  const [clients, inProcess, approved, docsPending, contractsOpen, disbursementsPending] = await Promise.all([
    prisma.client.count(),
    prisma.application.count({
      where: { status: { in: ["STUDY_PENDING", "STUDY_COMPLETED", "DOCUMENTS_PENDING", "IN_REVIEW", "INFO_REQUESTED"] } },
    }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.clientDocument.count({
      where: { status: { in: ["PENDING", "RECEIVED", "IN_REVIEW", "NEEDS_CORRECTION"] } },
    }),
    prisma.contract.count({ where: { status: { in: ["DRAFT", "PREPARED", "PENDING_SIGNATURE"] } } }),
    prisma.disbursement.count({ where: { status: { in: ["PENDING", "PREPARED"] } } }),
  ]);
  return { clients, inProcess, approved, docsPending, contractsOpen, disbursementsPending };
}

export type AdminGuideStats = Awaited<ReturnType<typeof adminGuideStats>>;

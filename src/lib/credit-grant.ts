import { prisma } from "./prisma";
import { createNotification } from "./notify";
import { REVIEW_WINDOW_MS } from "./process";

function pad(n: number, size: number) {
  return String(n).padStart(size, "0");
}

function makeAccountNumber(folio: string) {
  const digits = folio.replace(/\D/g, "").slice(-10) || String(Date.now()).slice(-10);
  return `ALX${pad(Number(digits.slice(-8) || 1) % 100000000, 8)}`;
}

function makeClabe(accountNumber: string) {
  const body = accountNumber.replace(/\D/g, "").padEnd(13, "0").slice(0, 13);
  return `646180${body}`.slice(0, 18);
}

export async function grantAuthorizedCredit(clientId: string, actorId?: string | null, source = "SYSTEM") {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { user: true, application: true, digitalAccount: true, savingsFund: true },
  });
  if (!client?.application) return null;
  if (client.application.status === "REJECTED") return client;

  const alreadyApproved = client.application.status === "APPROVED";
  const requested = Number(client.requestedAmount || client.application.amount || 0);

  await prisma.application.update({
    where: { id: client.application.id },
    data: {
      status: "APPROVED",
      reviewedAt: client.application.reviewedAt || new Date(),
      reviewedById: actorId || client.application.reviewedById,
    },
  });

  await prisma.client.update({
    where: { id: clientId },
    data: {
      authorizedAmount: requested > 0 ? requested : client.authorizedAmount,
      displayedAmount: requested > 0 ? requested : client.displayedAmount,
    },
  });

  if (!client.digitalAccount) {
    const accountNumber = makeAccountNumber(client.folio);
    await prisma.digitalAccount.create({
      data: {
        clientId,
        accountNumber,
        clabe: makeClabe(accountNumber),
        status: "TEMPORARY",
      },
    });
  }

  const slugs = ["cuenta-basica", "cuenta-digital", "credito-personal", "fondo-ahorro"];
  const products = await prisma.product.findMany({ where: { slug: { in: slugs } } });
  for (const product of products) {
    const amount = product.slug === "credito-personal" || product.slug === "cuenta-digital" ? requested : 0;
    await prisma.clientProduct.upsert({
      where: { clientId_productId: { clientId, productId: product.id } },
      create: {
        clientId,
        productId: product.id,
        status: "CONTRACTED",
        amount,
        available: true,
        blocked: false,
        contractedAt: new Date(),
        events: {
          create: {
            action: "CONTRACTED",
            note: source === "SYSTEM" ? "Alta automática por autorización" : "Alta por autorización",
            actorId: actorId || null,
          },
        },
      },
      update: {
        status: "CONTRACTED",
        available: true,
        blocked: false,
        amount: amount || undefined,
        contractedAt: new Date(),
        cancelledAt: null,
      },
    });
  }

  if (!client.savingsFund) {
    await prisma.savingsFund.create({
      data: {
        clientId,
        reference: `FA-${client.folio}`,
        amount: requested > 0 ? Math.round(requested * 0.03 * 100) / 100 : 0,
        status: "PENDING",
      },
    });
  }

  if (!alreadyApproved) {
    await createNotification({
      clientId,
      type: "APROBACION",
      title: "Felicidades, tu crédito fue autorizado",
      message:
        "Se creó una cuenta digital temporal para que recibas tu préstamo. Revisa tu cuenta, el fondo de ahorro y los productos habilitados.",
      channelPanel: true,
      channelEmail: true,
    });
  }

  return prisma.client.findUnique({
    where: { id: clientId },
    include: { application: true, digitalAccount: true, products: true },
  });
}

export async function maybeAutoApprove(clientId: string) {
  const app = await prisma.application.findUnique({ where: { clientId } });
  if (!app || app.status !== "IN_REVIEW" || !app.reviewStartedAt) return null;
  if (Date.now() - app.reviewStartedAt.getTime() < REVIEW_WINDOW_MS) return null;
  return grantAuthorizedCredit(clientId, null, "SYSTEM");
}

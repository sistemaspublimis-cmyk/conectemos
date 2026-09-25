import { prisma } from "./prisma";
import { requireClient } from "./auth";
import { getActiveBanners } from "./banners";
import { maybeAutoApprove } from "./credit-grant";

const clientInclude = {
  user: true,
  application: true,
  study: true,
  documents: { orderBy: { createdAt: "desc" as const } },
  notifications: { orderBy: { createdAt: "desc" as const } },
  bankDetails: true,
  offer: true,
  contract: true,
  disbursement: true,
  generatedDocs: { orderBy: { createdAt: "desc" as const } },
  products: {
    include: {
      product: true,
      events: { orderBy: { createdAt: "desc" as const } },
    },
    orderBy: { updatedAt: "desc" as const },
  },
  digitalAccount: true,
  savingsFund: true,
};

export async function getClientContext() {
  const ctx = await requireClient();
  if (!ctx) return null;
  let client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: clientInclude,
  });
  if (!client) return null;
  const auto = await maybeAutoApprove(client.id);
  if (auto) {
    const refreshed = await prisma.client.findUnique({
      where: { userId: ctx.user.id },
      include: clientInclude,
    });
    if (refreshed) client = refreshed;
  }
  const unread = client.notifications.filter((n) => !n.readAt).length;
  const banners = await getActiveBanners();
  return { user: client.user, client, unread, banners };
}

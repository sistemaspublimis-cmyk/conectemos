import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { ClientShell } from "@/components/client/shell";
import { Heartbeat } from "@/components/heartbeat";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");

  const h = await headers();
  const path = h.get("x-pathname") || "";
  const status = ctx.client.application?.status;
  const authorized = status === "APPROVED";
  const hasSolicitud =
    Boolean(ctx.client.study?.submitted) ||
    Boolean(status && status !== "STUDY_PENDING" && status !== "DRAFT");
  const newWindowMs = 14 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const newContracted = ctx.client.products
    .filter(
      (row) =>
        row.status === "CONTRACTED" &&
        row.contractedAt &&
        now - row.contractedAt.getTime() <= newWindowMs,
    )
    .map((row) => ({
      slug: row.product.slug,
      contractedAt: row.contractedAt!.toISOString(),
    }));

  if (path && !ctx.user.welcomeSeenAt && path !== "/mi-cuenta/bienvenida") {
    redirect("/mi-cuenta/bienvenida");
  }
  if (
    path &&
    ctx.user.welcomeSeenAt &&
    authorized &&
    !ctx.user.approvalSeenAt &&
    path !== "/mi-cuenta/autorizado"
  ) {
    redirect("/mi-cuenta/autorizado");
  }

  return (
    <ClientShell
      name={`${ctx.user.firstName} ${ctx.user.lastName}`}
      unread={ctx.unread}
      folio={ctx.client.folio}
      authorized={authorized}
      hasSolicitud={hasSolicitud}
      newContracted={newContracted}
    >
      <Heartbeat />
      {children}
    </ClientShell>
  );
}

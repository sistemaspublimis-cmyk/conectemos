import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { dashboardStats } from "@/lib/admin-counts";
import { formatMXN } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { NotifyForm } from "@/components/admin/forms";
import { whatsappConfigured } from "@/lib/whatsapp";
import { gmailConfigured } from "@/lib/email";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";

export default async function AdminDashboard() {
  const stats = await dashboardStats();
  const [recentApps, recentDocs, generated, conversations, activity, sessions, clients, notices] = await Promise.all([
    prisma.application.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { client: { include: { user: true } }, reviewedBy: true },
    }),
    prisma.clientDocument.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { client: { include: { user: true } } },
    }),
    prisma.generatedDocument.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { client: { include: { user: true } }, generatedBy: true },
    }),
    prisma.conversation.findMany({ take: 6, orderBy: { lastAt: "desc" } }),
    prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { actor: true, client: true } }),
    prisma.session.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: "desc" },
      take: 1,
      include: { user: true },
    }),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
      take: 50,
    }),
    prisma.application.findMany({
      where: { status: { in: ["IN_REVIEW", "INFO_REQUESTED"] } },
      take: 5,
    }),
  ]);

  const session = sessions[0];
  const waOn = whatsappConfigured();
  const mailOn = gmailConfigured();

  return (
    <div>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-black m-0">Dashboard</h1>
          <p className="text-xs text-[var(--muted)] mt-1">Resumen calculado desde la base de datos</p>
        </div>
        <div className="card px-4 py-3 text-xs">{new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}</div>
      </div>

      <section className="kpi-grid mt-4">
        {[
          ["♙", stats.clients, "Clientes registrados"],
          ["▣", stats.inProcess, "Solicitudes en proceso"],
          ["✓", stats.approved, "Solicitudes aprobadas"],
          ["▣", formatMXN(stats.authorized), "Monto autorizado"],
          ["$", formatMXN(stats.disbursed), "Monto desembolsado"],
        ].map(([icon, value, label]) => (
          <div key={label} className="kpi">
            <div className="w-10 h-10 rounded-full bg-[#e7f2f6] text-[var(--verde)] grid place-items-center text-xl">{icon}</div>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid xl:grid-cols-[1fr_355px] gap-3 mt-3">
        <div className="grid gap-3">
          <article className="card">
            <div className="flex justify-between p-3 border-b border-[var(--line)]">
              <h3 className="text-sm font-bold m-0">Solicitudes recientes</h3>
              <Link href="/admin/solicitudes" className="text-xs text-[#1255a4] font-bold">
                Ver todas
              </Link>
            </div>
            <div className="overflow-auto">
              <table className="admin-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Monto solicitado</th>
                    <th>Estado</th>
                    <th>Responsable</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-[var(--muted)]">
                        No hay solicitudes.
                      </td>
                    </tr>
                  )}
                  {recentApps.map((a) => (
                    <tr key={a.id}>
                      <td>{a.folio}</td>
                      <td>
                        <b>
                          {a.client.user.firstName} {a.client.user.lastName}
                        </b>

                        <div className="text-[10px] text-[var(--muted)]">{a.client.user.phone}</div>
                      </td>
                      <td>{a.product}</td>
                      <td>{formatMXN(a.amount)}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td>{a.reviewedBy ? `${a.reviewedBy.firstName} ${a.reviewedBy.lastName}` : "—"}</td>
                      <td>{a.createdAt.toLocaleDateString("es-MX")}</td>
                      <td>
                        <Link href={`/admin/clientes/${a.clientId}`} className="text-[#1255a4] font-bold">
                          Expediente
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid lg:grid-cols-3 gap-3">
            <article className="card p-3">
              <h3 className="text-sm font-bold">Documentos enviados recientemente</h3>
              {generated.length === 0 && <p className="text-xs text-[var(--muted)] mt-3">Sin documentos generados.</p>}
              {generated.map((d) => (
                <div key={d.id} className="py-2 border-b border-[var(--line)] text-xs">
                  <b>
                    {d.fileName}
                  </b>
                  <div className="text-[var(--muted)]">
                    {d.client.user.firstName} · {d.status === "PREPARED" ? "Preparado" : d.status}
                  </div>
                </div>
              ))}
            </article>
            <article className="card p-3">
              <h3 className="text-sm font-bold">Documentos recibidos</h3>
              {recentDocs.length === 0 && <p className="text-xs text-[var(--muted)] mt-3">Sin documentos.</p>}
              {recentDocs.map((d) => (
                <div key={d.id} className="py-2 border-b border-[var(--line)] text-xs flex justify-between gap-2">
                  <div>
                    <b>{d.originalName}</b>
                    <div className="text-[var(--muted)]">
                      {d.client.user.firstName} {d.client.user.lastName}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </article>
            <article className="card p-3">
              <h3 className="text-sm font-bold">Conversaciones de WhatsApp</h3>
              {!waOn && <div className="notice notice-gold mt-2 text-xs">WhatsApp no conectado</div>}
              {conversations.length === 0 && <p className="text-xs text-[var(--muted)] mt-3">No hay conversaciones.</p>}
              {conversations.map((c) => (
                <div key={c.id} className="py-2 border-b border-[var(--line)] text-xs">
                  <b>{c.phone}</b>
                  <div className="text-[var(--muted)]">{c.lastMessage}</div>
                </div>
              ))}
            </article>
          </div>

          <article className="card p-3">
            <h3 className="text-sm font-bold">Actividad reciente</h3>
            {activity.length === 0 && <p className="text-xs text-[var(--muted)]">Sin actividad.</p>}
            {activity.map((a) => (
              <div key={a.id} className="text-xs py-2 border-b border-[var(--line)] flex justify-between gap-3">
                <span>
                  <b>{a.action}</b> {a.actor ? `· ${a.actor.firstName}` : ""} {a.client ? `· ${a.client.folio}` : ""}
                </span>
                <time>{a.createdAt.toLocaleString("es-MX")}</time>
              </div>
            ))}
          </article>
        </div>

        <aside className="grid gap-3 content-start">
          <article className="card p-3">
            <h3 className="text-sm font-bold">Vista de sesión del usuario</h3>
            {session ? (
              <div className="mt-3 text-xs">
                <b>
                  {session.user.firstName} {session.user.lastName}
                </b>
                <div className="text-[var(--muted)]">{session.user.email}</div>
                <p className="flex justify-between mt-2">
                  <span>Última actividad</span>
                  <b>{session.lastSeenAt.toLocaleString("es-MX")}</b>
                </p>
                <p className="flex justify-between">
                  <span>Página</span>
                  <b>{session.currentPath || "—"}</b>
                </p>
                <p className="flex justify-between">
                  <span>IP</span>
                  <b>{session.ip || "—"}</b>
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] mt-2">No hay sesiones activas.</p>
            )}
          </article>
          <article className="card p-3">
            <h3 className="text-sm font-bold mb-2">Crear notificación para el usuario</h3>
            <NotifyForm
              clients={clients.map((c) => ({
                id: c.id,
                label: `${c.user.firstName} ${c.user.lastName} · ${c.folio}`,
              }))}
            />
          </article>
          <article className="card p-3">
            <h3 className="text-sm font-bold">Avisos importantes</h3>
            {!mailOn && <div className="notice notice-gold mt-2 text-xs">Gmail no configurado. Los correos quedan preparados.</div>}
            {!waOn && <div className="notice notice-gold mt-2 text-xs">WhatsApp no conectado.</div>}
            {notices.map((n) => (
              <div key={n.id} className="notice notice-blue mt-2 text-xs">
                {n.folio} · {APPLICATION_STATUS_LABEL[n.status]}
              </div>
            ))}
            {notices.length === 0 && mailOn && waOn && <p className="text-xs text-[var(--muted)] mt-2">Sin avisos.</p>}
          </article>
        </aside>
      </div>
    </div>
  );
}

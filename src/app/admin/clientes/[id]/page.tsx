import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMXN, toNumber } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { REQUIRED_DOC_TYPES } from "@/lib/process";
import {
  AmountForm,
  ApplicationActions,
  NotifyForm,
  PdfButtons,
  UserActions,
} from "@/components/admin/forms";
import { DisburseClient, OfferClient } from "@/components/admin/mini-actions";
import { PendingNotice } from "@/components/pending-notice";
import { whatsappConfigured } from "@/lib/whatsapp";
import { ClientProductsPanel } from "@/components/admin/client-products-form";
import { ExpedienteNav } from "@/components/admin/expediente-nav";

function normalizeTab(tab: string) {
  if (tab === "notificaciones" || tab === "correos" || tab === "whatsapp" || tab === "valoracion") return "avisos";
  if (tab === "contrato") return "datos";
  if (tab === "monto") return "oferta";
  if (tab === "bancarios") return "desembolso";
  if (tab === "bitacora" || tab === "generados") return "historial";
  return tab;
}

export default async function ExpedientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: rawTab = "datos" } = await searchParams;
  const tab = normalizeTab(rawTab);
  const [client, catalog] = await Promise.all([
    prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        application: { include: { reviewedBy: true } },
        study: true,
        documents: { include: { reviewedBy: true }, orderBy: { createdAt: "desc" } },
        notifications: { orderBy: { createdAt: "desc" } },
        amountHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
        bankDetails: true,
        offer: true,
        contract: true,
        disbursement: { include: { registeredBy: true } },
        emails: { orderBy: { createdAt: "desc" } },
        conversations: { include: { messages: { orderBy: { createdAt: "desc" }, take: 20 } } },
        generatedDocs: { orderBy: { createdAt: "desc" } },
        auditLogs: { include: { actor: true }, orderBy: { createdAt: "desc" }, take: 50 },
        products: { include: { product: true, events: { orderBy: { createdAt: "desc" }, take: 20 } } },
      },
    }),
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  if (!client) notFound();
  const name = `${client.user.firstName} ${client.user.lastName}`;
  const typeLabel = (t: string) => DOCUMENT_TYPES.find((d) => d.value === t)?.label || t;

  return (
    <div>
      <div className="flex justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-[var(--muted)]">CLIENTE · {client.folio}</p>
          <h1 className="text-2xl font-black m-0">
            {name}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {client.user.email} · {client.user.phone}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs">Monto mostrado</div>
          <div className="money text-2xl">{formatMXN(client.displayedAmount)}</div>
        </div>
      </div>

      <ExpedienteNav id={id} tab={tab} />

      <div className="card p-5 mt-3">
        {tab === "datos" && (
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <b>Nombre</b>
              <div>{name}</div>
            </div>
            <div>
              <b>Email</b>
              <div>{client.user.email}</div>
            </div>
            <div>
              <b>Teléfono</b>
              <div>{client.user.phone}</div>
            </div>
            <div>
              <b>WhatsApp</b>
              <div>{client.user.whatsapp}</div>
            </div>
            <div>
              <b>Estado de usuario</b>
              <div>
                <StatusBadge status={client.user.status} />
              </div>
            </div>
            <div>
              <b>Última actividad</b>
              <div>{client.user.lastActivityAt?.toLocaleString("es-MX") || "—"}</div>
            </div>
            <div className="sm:col-span-2">
              <h3 className="font-bold mb-2">Cuenta del cliente</h3>
              <UserActions clientId={client.id} />
            </div>
          </dl>
        )}

        {tab === "solicitud" && client.application && (
          <div className="grid gap-4">
            <p>
              Folio {client.application.folio} · {client.application.product} · {formatMXN(client.application.amount)} ·{" "}
              {client.application.termMonths || "—"} meses
            </p>
            <StatusBadge status={client.application.status} />
            {client.application.reviewedBy && (
              <p className="text-sm">
                Revisó: {client.application.reviewedBy.firstName} {client.application.reviewedBy.lastName} el{" "}
                {client.application.reviewedAt?.toLocaleString("es-MX")}
              </p>
            )}
            {client.application.rejectReason && <div className="notice notice-red">{client.application.rejectReason}</div>}
            {client.application.infoRequest && <div className="notice notice-gold">{client.application.infoRequest}</div>}
            <p className="text-sm text-[var(--muted)]">Para aprobar, rechazar o pedirle datos, entra a Avisos y aprobaciones.</p>
          </div>
        )}

        {tab === "estudio" && (
          <div className="text-sm grid gap-2">
            {!client.study?.submitted && <div className="notice notice-gold">El estudio aún no ha sido enviado.</div>}
            {client.study && (
              <>
                <p>
                  <b>Nombre:</b> {client.study.fullName}
                </p>
                <p>
                  <b>Nacimiento:</b> {client.study.birthDate}
                </p>
                <p>
                  <b>Estado civil:</b> {client.study.maritalStatus} · Dependientes: {client.study.dependents ?? "—"}
                </p>
                <p>
                  <b>Domicilio:</b> {client.study.address} {client.study.city} {client.study.state}
                </p>
                <p>
                  <b>Vivienda:</b> {client.study.housingType}
                </p>
                <p>
                  <b>Empleo:</b> {client.study.employmentType} · {client.study.company} · {client.study.position} · {client.study.seniority}
                </p>
                <p>
                  <b>Ingresos:</b> {formatMXN(client.study.monthlyIncome)} + {formatMXN(client.study.otherIncome)}
                </p>
                <p>
                  <b>Gastos:</b> vivienda {formatMXN(client.study.housingExpense)}, comida {formatMXN(client.study.foodExpense)},
                  servicios {formatMXN(client.study.utilitiesExpense)}, transporte {formatMXN(client.study.transportExpense)},
                  créditos {formatMXN(client.study.creditExpense)}, otros {formatMXN(client.study.otherExpense)}
                </p>
                <p>
                  <b>Créditos actuales:</b> {client.study.currentCredits || "—"}
                </p>
                <p>
                  <b>Deudas:</b> {client.study.debts || "—"}
                </p>
                <p>
                  <b>Referencias:</b> {client.study.references || "—"}
                </p>
                <p>
                  <b>Solicitud:</b> {formatMXN(client.study.requestedAmount)} · {client.study.termMonths || "—"} meses · {client.study.purpose}
                </p>
              </>
            )}
          </div>
        )}

        {tab === "documentos" && (
          <div className="grid gap-2">
            <p className="text-sm text-[var(--muted)] m-0">
              Los tres comprobantes del cliente. La palomita indica que ya hay archivo. Ábrelo para revisarlo.
            </p>
            {REQUIRED_DOC_TYPES.map((type) => {
              const doc = client.documents.find((d) => d.type === type);
              const ok = Boolean(doc);
              return (
                <div key={type} className="comp-row">
                  <span className={`comp-check ${ok ? "is-ok" : ""}`} aria-hidden>
                    {ok ? "✓" : ""}
                  </span>
                  <div className="min-w-0">
                    <b>{typeLabel(type)}</b>
                    <div className="text-xs text-[var(--muted)]">{doc?.originalName || "Sin archivo"}</div>
                  </div>
                  {doc ? (
                    <a className="btn btn-light !py-2 !px-3" href={`/api/documentos/${doc.id}/file`} target="_blank">
                      Abrir
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">Pendiente</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "oferta" && (
          <div className="grid gap-6">
            {client.offer ? (
              <p>
                Oferta {formatMXN(client.offer.amount)} · {client.offer.termMonths || "—"} meses · {client.offer.rate} ·{" "}
                {client.offer.status === "PREPARED" ? "Preparada" : "Pendiente"}
              </p>
            ) : (
              <PendingNotice>Aún no hay oferta. Prepárala aquí.</PendingNotice>
            )}
            <OfferClient id={client.id} />
            <AmountForm clientId={client.id} displayed={toNumber(client.displayedAmount)} authorized={toNumber(client.authorizedAmount)} />
            <h3 className="font-bold text-sm m-0">Historial de monto</h3>
            {client.amountHistory.map((h) => (
              <div key={h.id} className="text-xs py-2 border-b">
                {formatMXN(h.previous)} → {formatMXN(h.next)} · {h.changedBy.firstName} {h.changedBy.lastName} · {h.createdAt.toLocaleString("es-MX")}
              </div>
            ))}
          </div>
        )}

        {tab === "desembolso" && (
          <div className="grid gap-5">
            <div>
              <p>
                Estado: {client.disbursement?.status || "PENDIENTE"} · {formatMXN(client.disbursement?.amount || 0)}
              </p>
              {client.disbursement?.status !== "REGISTERED" && (
                <p className="text-xs text-[var(--muted)]">Confirma el desembolso para que el cliente lo vea en su cuenta.</p>
              )}
              <DisburseClient id={client.id} amount={toNumber(client.authorizedAmount)} />
            </div>
            <div className="text-sm">
              <h3 className="font-bold text-sm">Cuenta para desembolso</h3>
              {client.bankDetails ? (
                <>
                  <p>Titular: {client.bankDetails.holder}</p>
                  <p>Banco: {client.bankDetails.bank}</p>
                  <p>CLABE: {client.bankDetails.clabe}</p>
                  <p>Cuenta: {client.bankDetails.accountNumber}</p>
                </>
              ) : (
                <p>Sin datos bancarios.</p>
              )}
            </div>
          </div>
        )}

        {tab === "productos" && (
          <ClientProductsPanel
            clientId={client.id}
            items={catalog.map((product) => {
              const cp = client.products.find((p) => p.productId === product.id);
              return {
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  kind: product.kind,
                  active: product.active,
                },
                assigned: cp
                  ? {
                      status: cp.status,
                      amount: toNumber(cp.amount),
                      blocked: cp.blocked,
                      available: cp.available,
                      tapMessage: cp.tapMessage || "",
                      contractedAt: cp.contractedAt?.toISOString() ?? null,
                      cancelledAt: cp.cancelledAt?.toISOString() ?? null,
                      events: cp.events.map((e) => ({
                        id: e.id,
                        action: e.action,
                        note: e.note,
                        createdAt: e.createdAt.toISOString(),
                      })),
                    }
                  : null,
              };
            })}
          />
        )}

        {tab === "avisos" && (
          <div className="grid gap-8">
            <p className="text-sm text-[var(--muted)] m-0">
              Aquí decides el crédito y le escribes al cliente. Aprobar o rechazar cambia lo que ve en su cuenta.
              Las notificaciones, el correo y WhatsApp salen del mismo lugar para no perder el hilo.
            </p>
            {client.application ? (
              <section className="grid gap-3">
                <h3 className="font-bold text-[var(--verde2)] m-0">Aprobaciones</h3>
                <p className="text-sm text-[var(--muted)] m-0">
                  Folio {client.application.folio} · {client.application.product} · {formatMXN(client.application.amount)}
                </p>
                <StatusBadge status={client.application.status} />
                <ApplicationActions id={client.application.id} />
              </section>
            ) : null}
            <section className="grid gap-3">
              <h3 className="font-bold text-[var(--verde2)] m-0">Notificar al cliente</h3>
              <p className="text-sm text-[var(--muted)] m-0">El aviso llega a su panel. Si Gmail o WhatsApp están conectados, también por ese canal.</p>
              <NotifyForm clients={[{ id: client.id, label: name }]} defaultClientId={client.id} />
              {client.notifications.map((n) => (
                <div key={n.id} className="text-sm py-2 border-b">
                  <b>{n.title}</b>
                  <div>{n.message}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {n.createdAt.toLocaleString("es-MX")} · {n.readAt ? "Leída" : "No leída"}
                  </div>
                </div>
              ))}
            </section>
            <section className="grid gap-2">
              <h3 className="font-bold text-[var(--verde2)] m-0">Correo y WhatsApp</h3>
              {client.emails.length === 0 && <p className="text-sm text-[var(--muted)]">Sin correos todavía.</p>}
              {client.emails.map((e) => (
                <div key={e.id} className="text-sm py-2 border-b">
                  <b>{e.subject}</b> · <StatusBadge status={e.status} />
                  <div className="text-xs">{e.toEmail} · {e.eventType}</div>
                </div>
              ))}
              {!whatsappConfigured() && (
                <PendingNotice title="WhatsApp">Conecta Cloud API en Configuración para enviar desde aquí.</PendingNotice>
              )}
              {client.conversations.map((c) => (
                <div key={c.id} className="mt-2 text-sm">
                  <b>{c.phone}</b>
                  {c.messages.map((m) => (
                    <div key={m.id} className="text-xs py-1">
                      {m.direction}: {m.body} · {m.status}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "historial" && (
          <div className="text-sm grid gap-4">
            <PdfButtons clientId={client.id} />
            {client.generatedDocs.map((d) => (
              <div key={d.id} className="py-2 border-b flex justify-between">
                <span>{d.fileName}</span>
                <a href={`/api/archivos/${d.id}`} className="text-[#1255a4]">
                  Descargar
                </a>
              </div>
            ))}
            {client.amountHistory.map((h) => (
              <div key={h.id} className="py-2 border-b">
                Monto {formatMXN(h.previous)} → {formatMXN(h.next)} · {h.createdAt.toLocaleString("es-MX")}
              </div>
            ))}
            {client.application?.reviewedAt && (
              <div className="py-2 border-b">
                Solicitud {client.application.status} el {client.application.reviewedAt.toLocaleString("es-MX")}
              </div>
            )}
            {client.auditLogs.map((l) => (
              <div key={l.id} className="text-xs py-2 border-b">
                {l.createdAt.toLocaleString("es-MX")} · {l.action} · {l.actor ? `${l.actor.firstName} ${l.actor.lastName}` : "sistema"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

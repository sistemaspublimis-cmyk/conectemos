"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CLIENT_PRODUCT_STATUS_LABEL, PRODUCT_KIND_LABEL } from "@/lib/product-catalog";
import type { ProductKind } from "@prisma/client";

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: "badge-green",
  CONTRACTED: "badge-green",
  PENDING: "badge-orange",
  BLOCKED: "badge-red",
  UNAVAILABLE: "badge-gray",
  CANCELLED: "badge-gray",
};

export type AssignedProduct = {
  status: string;
  amount: number;
  blocked: boolean;
  available: boolean;
  tapMessage: string;
  contractedAt: string | null;
  cancelledAt: string | null;
  events: { id: string; action: string; note: string | null; createdAt: string }[];
};

export type CatalogItem = {
  product: {
    id: string;
    name: string;
    slug: string;
    kind: ProductKind;
    active: boolean;
  };
  assigned: AssignedProduct | null;
};

export function ClientProductsPanel({ clientId, items }: { clientId: string; items: CatalogItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No hay productos en el catálogo. Créalos en <a href="/admin/productos">Productos</a>.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">
        Asigna, contrata, bloquea o deshabilita cada producto de este cliente. El mensaje se muestra si intenta
        abrirlo bloqueado o no disponible.
      </p>
      {items.map((item) => (
        <ClientProductCard
          key={`${item.product.id}-${item.assigned?.status ?? "none"}-${item.assigned?.amount ?? 0}-${item.assigned?.blocked ? 1 : 0}-${item.assigned?.available ? 1 : 0}-${item.assigned?.events[0]?.id ?? "0"}`}
          clientId={clientId}
          item={item}
        />
      ))}
    </div>
  );
}

function ClientProductCard({ clientId, item }: { clientId: string; item: CatalogItem }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const assigned = item.assigned;
  const status = assigned?.status;
  const statusLabel = status ? CLIENT_PRODUCT_STATUS_LABEL[status] || status : "sin asignar";

  async function run(action: "save" | "contract" | "cancel" | "block" | "unblock") {
    if (!formRef.current) return;
    setErr("");
    setMsg("");
    setBusy(action);
    const fd = new FormData(formRef.current);
    const res = await fetch(`/api/admin/clientes/${clientId}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.product.id,
        action,
        amount: fd.get("amount"),
        tapMessage: fd.get("tapMessage"),
        blocked: fd.get("blocked") === "on",
        available: fd.get("available") === "on",
      }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setErr(data.error || "Error");
      return;
    }
    const labels: Record<string, string> = {
      save: "Cambios guardados.",
      contract: "Producto contratado.",
      cancel: "Producto cancelado.",
      block: "Producto bloqueado.",
      unblock: "Producto desbloqueado.",
    };
    setMsg(labels[action] || "Actualizado.");
    router.refresh();
  }

  return (
    <div className="border border-[var(--line)] rounded-lg p-4 grid gap-3">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h3 className="font-bold m-0">{item.product.name}</h3>
          <p className="text-xs text-[var(--muted)] m-0">
            {PRODUCT_KIND_LABEL[item.product.kind]} · {item.product.slug}
            {!item.product.active ? " · oculto del catálogo" : ""}
          </p>
        </div>
        <span className={`badge ${status ? STATUS_BADGE[status] || "badge-blue" : "badge-gray"}`}>
          {statusLabel}
        </span>
      </div>
      {assigned && (assigned.contractedAt || assigned.cancelledAt) && (
        <p className="text-xs text-[var(--muted)] m-0">
          {assigned.contractedAt ? `Contratado: ${new Date(assigned.contractedAt).toLocaleString("es-MX")}` : ""}
          {assigned.contractedAt && assigned.cancelledAt ? " · " : ""}
          {assigned.cancelledAt ? `Cancelado: ${new Date(assigned.cancelledAt).toLocaleString("es-MX")}` : ""}
        </p>
      )}

      <form ref={formRef} className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="field">
            Monto
            <input name="amount" defaultValue={assigned?.amount ?? 0} />
          </label>
          <div className="flex flex-col justify-end gap-2 text-xs pb-1">
            <label>
              <input type="checkbox" name="blocked" defaultChecked={assigned?.blocked ?? false} /> Bloqueado
            </label>
            <label>
              <input type="checkbox" name="available" defaultChecked={assigned?.available ?? true} /> Disponible
            </label>
          </div>
        </div>
        <label className="field">
          Mensaje al intentar abrir
          <textarea
            name="tapMessage"
            defaultValue={assigned?.tapMessage || ""}
            placeholder="Texto que ve el cliente si el producto está bloqueado o no disponible"
          />
        </label>
        {err && <div className="notice notice-red">{err}</div>}
        {msg && <div className="notice notice-green">{msg}</div>}
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-green !py-2 text-xs" type="button" disabled={!!busy} onClick={() => run("contract")}>
            Contratar
          </button>
          <button className="btn btn-light !py-2 text-xs" type="button" disabled={!!busy} onClick={() => run("cancel")}>
            Cancelar
          </button>
          <button className="btn btn-light !py-2 text-xs" type="button" disabled={!!busy} onClick={() => run("save")}>
            Guardar
          </button>
          <button className="btn btn-danger !py-2 text-xs" type="button" disabled={!!busy} onClick={() => run("block")}>
            Bloquear
          </button>
        </div>
      </form>

      <div>
        <h4 className="text-xs font-bold m-0 mb-1">Historial</h4>
        {!assigned?.events.length && <p className="text-xs text-[var(--muted)] m-0">Sin eventos.</p>}
        {assigned?.events.map((event) => (
          <div key={event.id} className="text-xs py-1 border-b border-[#eef1f0]">
            {new Date(event.createdAt).toLocaleString("es-MX")} · {event.action}
            {event.note ? ` · ${event.note}` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

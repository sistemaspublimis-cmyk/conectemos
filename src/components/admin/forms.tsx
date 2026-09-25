"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export function ApplicationActions({ id }: { id: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function run(action: string) {
    setErr("");
    setMsg("");
    const res = await fetch(`/api/admin/solicitudes/${id}/accion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else {
      setMsg("Estado actualizado.");
      router.refresh();
    }
  }

  return (
    <div className="grid gap-3">
      <label className="field">
        Motivo / información adicional
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {err && <div className="notice notice-red">{err}</div>}
      {msg && <div className="notice notice-green">{msg}</div>}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-green" onClick={() => run("aprobar")}>
          Aprobar
        </button>
        <button className="btn btn-light" onClick={() => run("info")}>
          Solicitar información
        </button>
        <button className="btn btn-danger" onClick={() => run("rechazar")}>
          Rechazar
        </button>
      </div>
    </div>
  );
}

export function AmountForm({
  clientId,
  displayed,
  authorized,
}: {
  clientId: string;
  displayed: number;
  authorized: number;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/clientes/${clientId}/monto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayedAmount: fd.get("displayedAmount"),
        authorizedAmount: fd.get("authorizedAmount"),
        note: fd.get("note"),
      }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else {
      setMsg("Monto actualizado. El cliente verá el nuevo valor.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 max-w-md">
      <label className="field">
        Monto mostrado al cliente
        <input name="displayedAmount" defaultValue={displayed} required />
      </label>
      <label className="field">
        Monto autorizado
        <input name="authorizedAmount" defaultValue={authorized} />
      </label>
      <label className="field">
        Nota
        <input name="note" />
      </label>
      {err && <div className="notice notice-red">{err}</div>}
      {msg && <div className="notice notice-green">{msg}</div>}
      <button className="btn btn-green">Guardar monto</button>
    </form>
  );
}

export function DocReviewForm({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/documentos/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: fd.get("status"), comments: fd.get("comments") }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2">
      <select name="status" defaultValue={current} className="border rounded-lg p-2 text-sm">
        <option value="RECEIVED">Recibido</option>
        <option value="IN_REVIEW">En revisión</option>
        <option value="APPROVED">Aprobado</option>
        <option value="REJECTED">Rechazado</option>
        <option value="NEEDS_CORRECTION">Requiere corrección</option>
      </select>
      <input name="comments" placeholder="Comentario / motivo" className="border rounded-lg p-2 text-sm" />
      {err && <div className="text-xs text-[var(--danger)]">{err}</div>}
      <button className="btn btn-light !py-2 text-xs">Actualizar</button>
    </form>
  );
}

export function NotifyForm({ clients, defaultClientId }: { clients: { id: string; label: string }[]; defaultClientId?: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/notificaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: fd.get("clientId"),
        type: fd.get("type"),
        title: fd.get("title"),
        message: fd.get("message"),
        channelPanel: fd.get("panel") === "on",
        channelEmail: fd.get("email") === "on",
        channelWhatsapp: fd.get("whatsapp") === "on",
      }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else {
      setMsg(
        `Notificación creada en panel. Correo: ${data.emailStatus === "SENT" ? "enviado" : data.emailStatus === "PREPARED" ? "preparado (Gmail no configurado)" : data.emailStatus}. WhatsApp: ${data.whatsappStatus === "SENT" ? "enviado" : "no enviado / preparado"}.`,
      );
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="field">
        Usuario
        <select name="clientId" defaultValue={defaultClientId || ""} required>
          <option value="">Seleccionar usuario</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Tipo
        <select name="type">
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Título
        <input name="title" required />
      </label>
      <label className="field">
        Mensaje
        <textarea name="message" required />
      </label>
      <div className="flex flex-wrap gap-4 text-xs">
        <label>
          <input type="checkbox" name="panel" defaultChecked /> Panel
        </label>
        <label>
          <input type="checkbox" name="email" /> Correo
        </label>
        <label>
          <input type="checkbox" name="whatsapp" /> WhatsApp
        </label>
      </div>
      {err && <div className="notice notice-red">{err}</div>}
      {msg && <div className="notice notice-green">{msg}</div>}
      <button className="btn btn-green">Crear notificación</button>
    </form>
  );
}

export function UserActions({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function run(action: string) {
    const res = await fetch(`/api/admin/clientes/${clientId}/usuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || "Error");
    else {
      setMsg(data.devLink ? `Enlace preparado (Gmail no configurado): ${data.devLink}` : "Actualizado.");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-green" onClick={() => run("activar")}>
        Activar
      </button>
      <button className="btn btn-light" onClick={() => run("desactivar")}>
        Desactivar
      </button>
      <button className="btn btn-danger" onClick={() => run("bloquear")}>
        Bloquear
      </button>
      <button className="btn btn-gold" onClick={() => run("restablecer")}>
        Restablecer acceso
      </button>
      {msg && <div className="notice notice-gold w-full text-xs">{msg}</div>}
    </div>
  );
}

export function PdfButtons({ clientId }: { clientId: string }) {
  const router = useRouter();
  const kinds = [
    ["solicitud", "Solicitud"],
    ["estudio", "Estudio"],
    ["resumen-aprobacion", "Resumen de aprobación"],
    ["oferta", "Oferta"],
    ["contrato", "Contrato"],
    ["comprobante", "Comprobante"],
    ["estado-cuenta", "Estado de cuenta"],
  ];
  async function gen(type: string) {
    await fetch(`/api/admin/pdf/${clientId}/${type}`, { method: "POST" });
    router.refresh();
  }
  return (
    <div className="flex flex-wrap gap-2">
      {kinds.map(([k, l]) => (
        <button key={k} className="btn btn-light !py-2 text-xs" onClick={() => gen(k)}>
          Generar {l}
        </button>
      ))}
    </div>
  );
}

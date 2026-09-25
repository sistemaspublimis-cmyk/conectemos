"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function OfferClient({ id }: { id: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/admin/oferta/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: fd.get("amount"),
        termMonths: fd.get("termMonths"),
        rate: fd.get("rate"),
        notes: fd.get("notes"),
      }),
    });
    setMsg("Oferta preparada.");
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-2 mt-4">
      <label className="field">Monto<input name="amount" /></label>
      <label className="field">Plazo (meses)<input name="termMonths" /></label>
      <label className="field">Tasa (texto)<input name="rate" placeholder="Ej. 7.5% anual" /></label>
      <label className="field">Notas<input name="notes" /></label>
      <button className="btn btn-green sm:col-span-2">Preparar oferta</button>
      {msg && <div className="notice notice-green sm:col-span-2">{msg}</div>}
    </form>
  );
}

export function ContractClient({ id, defaultBody }: { id: string; defaultBody: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/admin/contrato/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: fd.get("body") }),
    });
    setMsg("Contrato preparado.");
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-2 mt-4">
      <label className="field">
        Cuerpo (variables {"{{cliente.nombre}}"}, {"{{solicitud.folio}}"}, {"{{solicitud.monto}}"})
        <textarea name="body" defaultValue={defaultBody} className="min-h-[180px]" />
      </label>
      <button className="btn btn-green">Preparar contrato</button>
      {msg && <div className="notice notice-green">{msg}</div>}
    </form>
  );
}

export function DisburseClient({ id, amount }: { id: string; amount: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/admin/desembolsos/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: fd.get("amount"),
        status: fd.get("status"),
        note: fd.get("note"),
      }),
    });
    setMsg("Actualizado.");
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-2 mt-4 max-w-md">
      <label className="field">Monto<input name="amount" defaultValue={amount} /></label>
      <label className="field">
        Estado
        <select name="status">
          <option value="PENDING">Pendiente</option>
          <option value="PREPARED">Preparado</option>
          <option value="REGISTERED">Registrado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </label>
      <label className="field">Nota<input name="note" /></label>
      <button className="btn btn-green">Guardar desembolso</button>
      {msg && <div className="notice notice-green">{msg}</div>}
    </form>
  );
}

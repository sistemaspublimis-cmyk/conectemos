"use client";

import { FormEvent, useState } from "react";

export function BankForm({
  initial,
}: {
  initial: {
    holder?: string;
    bank?: string;
    clabe?: string;
    accountNumber?: string;
    branch?: string;
    accountType?: string;
  };
}) {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/bancarios", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else setMsg("Datos guardados. La cuenta quedará en verificación.");
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 mt-2 grid sm:grid-cols-2 gap-3 fade-up bank-card">
      <label className="field">
        Titular
        <input name="holder" defaultValue={initial.holder} required />
      </label>
      <label className="field">
        Banco
        <input name="bank" defaultValue={initial.bank} required />
      </label>
      <label className="field">
        CLABE (18 dígitos)
        <input name="clabe" defaultValue={initial.clabe} required />
      </label>
      <label className="field">
        Número de cuenta
        <input name="accountNumber" defaultValue={initial.accountNumber} />
      </label>
      <label className="field">
        Sucursal
        <input name="branch" defaultValue={initial.branch} />
      </label>
      <label className="field">
        Tipo de cuenta
        <input name="accountType" defaultValue={initial.accountType} />
      </label>
      {err && <div className="notice notice-red sm:col-span-2">{err}</div>}
      {msg && <div className="notice notice-green sm:col-span-2">{msg}</div>}
      <p className="sm:col-span-2 text-xs text-[var(--muted)] m-0">
        Usaremos esta cuenta para el desembolso de tu financiamiento.
      </p>
      <button className="btn btn-green sm:col-span-2">Guardar</button>
    </form>
  );
}

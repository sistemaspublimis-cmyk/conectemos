"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ComprobanteForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fondo-ahorro", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "No se pudo enviar el comprobante.");
      return;
    }
    setMsg("Comprobante recibido. Queda en validación.");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="field">
        Comprobante (PDF, JPG, PNG, WEBP · máx. 10 MB)
        <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" required />
      </label>
      {err && <div className="notice notice-red">{err}</div>}
      {msg && <div className="notice notice-green">{msg}</div>}
      <button className="btn btn-green" disabled={loading}>
        {loading ? "Enviando..." : "Enviar comprobante"}
      </button>
    </form>
  );
}

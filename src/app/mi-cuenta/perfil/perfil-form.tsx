"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PerfilForm({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/perfil", { method: "POST", body: fd });
    if (res.ok) {
      setMsg("Datos actualizados.");
      router.refresh();
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="field">Teléfono<input name="phone" defaultValue={phone} /></label>
      <label className="field">WhatsApp<input name="whatsapp" defaultValue={whatsapp} /></label>
      {msg && <div className="notice notice-green">{msg}</div>}
      <button className="btn btn-green">Guardar</button>
    </form>
  );
}

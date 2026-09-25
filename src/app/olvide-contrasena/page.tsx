"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPage() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email") }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else setMsg(data.message);
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[var(--crema)]">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl grid gap-4 shadow">
        <h1 className="text-xl font-black text-[var(--verde2)]">Restablecer acceso</h1>
        <label className="field">Correo<input name="email" type="email" required /></label>
        {err && <div className="notice notice-red">{err}</div>}
        {msg && <div className="notice notice-green">{msg}</div>}
        <button className="btn btn-green">Enviar enlace</button>
        <Link href="/login" className="text-sm text-center">
          Volver
        </Link>
      </form>
    </div>
  );
}

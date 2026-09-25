"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (String(fd.get("password")) !== String(fd.get("confirm"))) {
      setErr("Las contraseñas no coinciden");
      return;
    }
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: fd.get("password") }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Error");
    else setMsg("Contraseña actualizada. Ya puedes iniciar sesión.");
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[var(--crema)]">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl grid gap-4 shadow">
        <h1 className="text-xl font-black text-[var(--verde2)]">Nueva contraseña</h1>
        <label className="field">Contraseña<input name="password" type="password" required /></label>
        <label className="field">Confirmar<input name="confirm" type="password" required /></label>
        {err && <div className="notice notice-red">{err}</div>}
        {msg && <div className="notice notice-green">{msg}</div>}
        <button className="btn btn-green">Guardar</button>
        <Link href="/login" className="text-sm text-center">
          Ir a iniciar sesión
        </Link>
      </form>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

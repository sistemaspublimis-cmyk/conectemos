"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { clearAdminIntroSession } from "@/lib/admin-section-copy";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(params.get("error") === "cuenta" ? "Tu cuenta está desactivada o bloqueada." : "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo iniciar sesión");
      return;
    }
    if (data.showAdminWelcome) clearAdminIntroSession();
    router.push(params.get("next") || data.redirect || "/mi-cuenta");
    router.refresh();
  }

  return (
    <div className="login-wrap min-h-screen grid place-items-center p-6" style={{ background: "linear-gradient(135deg,#f3f8fb,#e7f2f6)" }}>
      <div className="w-full max-w-[920px] grid md:grid-cols-2 bg-white rounded-[20px] overflow-hidden shadow-2xl">
        <div className="hidden md:block p-10 text-white bg-gradient-to-br from-[var(--verde2)] to-[var(--verde)]">
          <img src="/logo.png" alt="" className="w-24 h-24 rounded-2xl bg-white object-contain" />
          <h2 className="text-2xl font-black mt-8">Conectemos</h2>
          <p className="mt-3 text-sm text-[#d5e6ee]">Consulta el avance de tu solicitud, carga documentos y revisa tu expediente.</p>
          <div className="mt-8 text-sm leading-8">
            ✓ Proceso en línea
            <br />
            ✓ Seguridad y confidencialidad
            <br />
            ✓ Seguimiento de tu trámite
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-8 md:p-12 grid gap-4">
          <h1 className="text-2xl font-black text-[var(--verde2)]">Inicia sesión</h1>
          <p className="text-sm text-[var(--muted)]">Accede para continuar con tu solicitud o administrar expedientes.</p>
          <label className="field">Correo<input name="email" type="email" required autoComplete="email" /></label>
          <label className="field">Contraseña<input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <div className="notice notice-red">{error}</div>}
          <button className="btn btn-green" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
          <Link href="/olvide-contrasena" className="text-center text-xs text-[var(--muted)]">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/registro" className="text-center text-sm font-bold text-[var(--verde)]">
            Crear cuenta
          </Link>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

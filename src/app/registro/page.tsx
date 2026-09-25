"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ProgressBar } from "@/components/client/progress-bar";
import { STAGE_IMAGES } from "@/lib/process";
import { catalogBySlug } from "@/lib/product-catalog";

export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegistroForm />
    </Suspense>
  );
}

function RegistroForm() {
  const router = useRouter();
  const params = useSearchParams();
  const chosen = catalogBySlug(params.get("producto") || "");
  const monto = Number(params.get("monto") || 0);
  const plazo = Number(params.get("plazo") || 0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") || "").replace(/\D/g, "");
    const whatsapp = String(fd.get("whatsapp") || "").replace(/\D/g, "");
    const password = String(fd.get("password") || "");
    if (phone.length < 8) {
      setError("El teléfono debe tener al menos 8 dígitos.");
      return;
    }
    if (whatsapp.length < 8) {
      setError("El WhatsApp debe tener al menos 8 dígitos.");
      return;
    }
    if (password !== String(fd.get("confirm"))) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, con letras y números.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        whatsapp: fd.get("whatsapp"),
        password: fd.get("password"),
        product: chosen?.name,
        amount: monto > 0 ? monto : undefined,
        termMonths: plazo > 0 ? plazo : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo registrar");
      return;
    }
    router.push("/mi-cuenta/bienvenida");
    router.refresh();
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "linear-gradient(135deg,#f7f5ef,#edf5f3)" }}>
      <div className="max-w-[1080px] mx-auto">
        <ProgressBar current={1} total={9} percent={0} label="Registro" />
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-[22px] overflow-hidden shadow-2xl">
          <div className="relative min-h-[240px] hidden md:block">
            <img
              src={STAGE_IMAGES.registro}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#043848]/90 via-[#06556f]/35 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--dorado2)]">Paso 1 de 9</p>
              <h2 className="text-2xl font-black mt-2">Comenzamos tu expediente</h2>
              <p className="text-sm text-white/85 mt-2 leading-relaxed">
                Creamos tu cuenta y un folio confidencial para dar seguimiento a tu solicitud de financiamiento.
              </p>
            </div>
          </div>
          <form onSubmit={onSubmit} className="p-6 md:p-10 grid gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="w-12 h-12 rounded-xl bg-white object-contain border border-[var(--line)]" />
              <b className="text-[var(--verde)]">Pedir crédito</b>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[var(--verde2)]">
                {chosen ? `Pide tu ${chosen.name.toLowerCase()}` : "Pide tu crédito"}
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
                {chosen
                  ? "Deja tus datos y seguimos con esta solicitud."
                  : "Deja tus datos y te abrimos la solicitud en unos minutos."}
                {monto > 0 ? ` Monto que armaste: $${monto.toLocaleString("es-MX")}.` : ""}
                {plazo > 0 ? ` Plazo: ${plazo} meses.` : ""}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="field">Nombre<input name="firstName" required autoComplete="given-name" /></label>
              <label className="field">Apellidos<input name="lastName" required autoComplete="family-name" /></label>
            </div>
            <label className="field">Correo<input name="email" type="email" required autoComplete="email" /></label>
            <label className="field">Teléfono<input name="phone" inputMode="tel" placeholder="5512345678" required autoComplete="tel" /></label>
            <label className="field">WhatsApp<input name="whatsapp" inputMode="tel" placeholder="5512345678" required /></label>
            <label className="field">
              Contraseña
              <input name="password" type="password" minLength={8} required autoComplete="new-password" />
              <small className="text-[11px] text-[var(--muted)] font-normal">Mínimo 8 caracteres, con letras y números.</small>
            </label>
            <label className="field">Confirmar contraseña<input name="confirm" type="password" minLength={8} required autoComplete="new-password" /></label>
            {error && <div className="notice notice-red">{error}</div>}
            <button className="btn btn-green" disabled={loading}>
              {loading ? "Creando..." : "Crear cuenta y continuar"}
            </button>
            <div className="notice notice-blue text-sm">
              <b>¿Qué sigue?</b>
              <div className="mt-1">Entras a tu cuenta y seguimos con tu oferta.</div>
            </div>
            <Link href="/login" className="text-center text-sm">
              Ya tengo cuenta
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

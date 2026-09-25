"use client";

import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { BRAND, brandAddressLines } from "@/lib/constants";
import { CATALOG_SEED } from "@/lib/product-catalog";

export default function ContactoPage() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const product = String(fd.get("product") || "").trim();
    const message = String(fd.get("message") || "").trim();
    if (product) fd.set("message", `Producto de interés: ${product}\n\n${message}`);
    fd.delete("product");
    const res = await fetch("/api/contacto", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "No se pudo enviar");
    else {
      setMsg("Mensaje recibido. Quedó registrado para el equipo.");
      e.currentTarget.reset();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-[980px] mx-auto px-4 py-14 flex-1 w-full">
        <h1 className="text-3xl font-black text-[var(--verde2)]">Contacto</h1>
        <p className="text-[var(--muted)] mt-2 max-w-xl">
          Escribe por un crédito, una tarjeta, arrendamiento, factoraje o una duda de tu expediente. El seguimiento del
          trámite vive en el portal.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-8 items-start">
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="field">Nombre<input name="name" required /></label>
            <label className="field">Correo<input name="email" type="email" required /></label>
            <label className="field">Teléfono<input name="phone" /></label>
            <label className="field">
              Producto
              <select name="product" defaultValue="Crédito personal">
                {CATALOG_SEED.map((item) => (
                  <option key={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="field">Mensaje<textarea name="message" required /></label>
            {err && <div className="notice notice-red">{err}</div>}
            {msg && <div className="notice notice-green">{msg}</div>}
            <button className="btn btn-green">Enviar</button>
          </form>
          <aside className="card p-5 grid gap-3 text-sm leading-6">
            <b className="text-[var(--verde2)]">Nos encuentras en</b>
            {brandAddressLines().map((line) => (
              <div key={line}>{line}</div>
            ))}
            <a href={`mailto:${BRAND.email}`} className="font-bold text-[var(--verde)]">
              {BRAND.email}
            </a>
            <p>Ahí te respondemos y el folio queda en tu cuenta.</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

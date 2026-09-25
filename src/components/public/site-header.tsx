"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/constants";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/97 backdrop-blur border-b border-[var(--line)]">
      <div className="bg-[var(--verde2)] text-white text-xs">
        <div className="max-w-[1180px] mx-auto px-4 h-10 flex items-center justify-between">
          <span>{BRAND.legal}</span>
          <Link href="/login">Portal del cliente</Link>
        </div>
      </div>
      <div className="max-w-[1180px] mx-auto px-4 h-[84px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt={BRAND.legalFull} className="h-16 w-auto max-w-[108px] object-contain" />
          <div className="leading-tight">
            <strong className="block text-[var(--verde)] text-[15px] sm:text-[17px]">{BRAND.name}</strong>
            <span className="block text-[var(--dorado)] text-[11px] font-extrabold tracking-wide">JUNTO CONTIGO</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-[13px] font-extrabold">
          <Link href="/productos">Productos</Link>
          <Link href="/requisitos">Requisitos</Link>
          <Link href="/faq">Preguntas frecuentes</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/login" className="btn btn-light !py-2">Iniciar sesión</Link>
          <Link href="/registro" className="btn btn-gold !py-2">Pedir crédito</Link>
        </nav>
        <button className="md:hidden text-3xl text-[var(--verde)]" onClick={() => setOpen(!open)} aria-label="Menú">
          ☰
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[var(--line)] px-4 py-4 grid gap-3 font-extrabold">
          <Link href="/productos" onClick={() => setOpen(false)}>Productos</Link>
          <Link href="/requisitos" onClick={() => setOpen(false)}>Requisitos</Link>
          <Link href="/faq" onClick={() => setOpen(false)}>Preguntas frecuentes</Link>
          <Link href="/contacto" onClick={() => setOpen(false)}>Contacto</Link>
          <Link href="/login" onClick={() => setOpen(false)}>Iniciar sesión</Link>
          <Link href="/registro" className="btn btn-gold" onClick={() => setOpen(false)}>Pedir crédito</Link>
        </div>
      )}
    </header>
  );
}

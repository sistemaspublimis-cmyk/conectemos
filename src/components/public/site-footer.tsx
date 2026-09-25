import Link from "next/link";
import { BRAND, brandAddressLines } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--verde2)] text-white mt-auto">
      <div className="max-w-[1180px] mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <img src="/logo.png" alt="" className="w-16 h-16 rounded-2xl bg-white object-contain mb-3" />
          <b>{BRAND.name}</b>
          <p className="text-[#d5e6ee] mt-2 text-xs leading-5">{BRAND.legalFull}</p>
          <p className="text-[#d5e6ee] mt-3 text-xs leading-5">
            Tu oferta llega con pago, plazo y condiciones para que contrates con los números a la vista.
          </p>
        </div>
        <div className="grid gap-2 content-start">
          <Link href="/productos">Productos</Link>
          <Link href="/requisitos">Requisitos</Link>
          <Link href="/faq">Preguntas frecuentes</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
        <div className="text-[#d5e6ee] text-xs leading-6">
          <b className="block text-white text-sm mb-1">Contacto</b>
          {brandAddressLines().map((line) => (
            <div key={line}>{line}</div>
          ))}
          <a href={`mailto:${BRAND.email}`} className="block mt-3 text-white">
            {BRAND.email}
          </a>
        </div>
      </div>
    </footer>
  );
}

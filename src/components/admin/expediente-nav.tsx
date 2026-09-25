"use client";

import Link from "next/link";
import { useState } from "react";

const DATOS_ITEMS = [
  { key: "datos", label: "Datos personales" },
  { key: "solicitud", label: "Solicitud" },
  { key: "estudio", label: "Estudio" },
];

const TABS: { key: string; label: string; group?: "datos" }[] = [
  { key: "datos", label: "Datos personales", group: "datos" },
  { key: "documentos", label: "Comprobantes" },
  { key: "oferta", label: "Oferta y monto" },
  { key: "desembolso", label: "Desembolso" },
  { key: "productos", label: "Productos" },
  { key: "avisos", label: "Avisos y aprobaciones" },
  { key: "historial", label: "Historial" },
];

export function ExpedienteNav({ id, tab }: { id: string; tab: string }) {
  const [open, setOpen] = useState(false);
  const datosActive = tab === "datos" || tab === "solicitud" || tab === "estudio";
  const datosLabel = DATOS_ITEMS.find((item) => item.key === tab)?.label || "Datos personales";

  return (
    <nav className="exp-nav">
      {TABS.map((item) => {
        if (item.group === "datos") {
          return (
            <div key="datos" className="exp-nav-drop">
              <button
                type="button"
                className={`exp-nav-chip ${datosActive ? "is-on" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                {datosLabel}
                <span aria-hidden>▾</span>
              </button>
              {open ? (
                <div className="exp-nav-menu">
                  {DATOS_ITEMS.map((sub) => (
                    <Link
                      key={sub.key}
                      href={`/admin/clientes/${id}?tab=${sub.key}`}
                      className={tab === sub.key ? "is-on" : ""}
                      onClick={() => setOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }
        return (
          <Link
            key={item.key}
            href={`/admin/clientes/${id}?tab=${item.key}`}
            className={`exp-nav-chip ${tab === item.key ? "is-on" : ""}`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

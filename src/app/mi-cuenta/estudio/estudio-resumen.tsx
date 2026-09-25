import Link from "next/link";
import { formatMXN } from "@/lib/money";

export function EstudioResumen({
  folio,
  fullName,
  birthDate,
  city,
  state,
  zip,
  employmentType,
  company,
  monthlyIncome,
  requestedAmount,
  termMonths,
  purpose,
  nextHref = "/mi-cuenta/documentos",
  nextLabel = "Continuar con documentos",
}: {
  folio: string;
  fullName?: string | null;
  birthDate?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  employmentType?: string | null;
  company?: string | null;
  monthlyIncome?: unknown;
  requestedAmount?: unknown;
  termMonths?: number | null;
  purpose?: string | null;
  nextHref?: string;
  nextLabel?: string;
}) {
  const place = [city, state, zip].filter(Boolean).join(" · ");
  return (
    <div className="grid gap-4">
      <div className="notice notice-green">
        <b>Estudio realizado</b>
        <div className="mt-1">Tu estudio socioeconómico ya quedó registrado. No se puede modificar.</div>
      </div>
      <article className="card p-5 grid gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)] m-0">Datos básicos</p>
        <h2 className="text-xl font-black text-[var(--verde2)] m-0">{fullName || "Cliente"}</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm m-0">
          <div>
            <dt className="text-[var(--muted)] text-xs">Folio</dt>
            <dd className="font-bold m-0">{folio}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Fecha de nacimiento</dt>
            <dd className="font-bold m-0">{birthDate || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Domicilio</dt>
            <dd className="font-bold m-0">{place || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Actividad</dt>
            <dd className="font-bold m-0">{[employmentType, company].filter(Boolean).join(" · ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Ingreso mensual</dt>
            <dd className="font-bold m-0">{monthlyIncome != null && monthlyIncome !== "" ? formatMXN(monthlyIncome) : "—"}</dd>
          </div>
        </dl>
      </article>
      <article className="card p-5 grid gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)] m-0">Solicitud del préstamo</p>
        <div className="money text-3xl">{requestedAmount != null && requestedAmount !== "" ? formatMXN(requestedAmount) : "—"}</div>
        <p className="text-sm m-0">
          <b>Plazo:</b> {termMonths ? `${termMonths} meses` : "—"}
        </p>
        <p className="text-sm m-0">
          <b>Destino:</b> {purpose || "—"}
        </p>
      </article>
      <Link href={nextHref} className="btn btn-green w-full sm:w-auto">
        {nextLabel}
      </Link>
    </div>
  );
}

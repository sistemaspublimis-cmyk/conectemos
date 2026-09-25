"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/client/signature-pad";

export function ContratoView({
  filledBody,
  isOfficial,
  pdfs,
  signatureDraftAt,
  approved,
}: {
  filledBody: string;
  isOfficial: boolean;
  pdfs: { id: string; fileName: string }[];
  signatureDraftAt: string | null;
  approved: boolean;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function generatePdf() {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/contrato/pdf", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "No se pudo generar el PDF");
      return;
    }
    window.location.href = `/api/archivos/${data.id}`;
    router.refresh();
  }

  async function confirmSignature() {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/contrato/firma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preview }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "No se pudo guardar la rúbrica");
      return;
    }
    setMsg(data.message);
    router.refresh();
  }

  return (
    <div className="grid gap-4 fade-up">
      <article className="card overflow-hidden">
        <div
          className="h-36 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg,rgba(6,75,57,.88),rgba(6,75,57,.35)), url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`badge ${isOfficial ? "badge-green" : "badge-gold"}`}>
              {isOfficial ? "Listo para firma" : "En preparación"}
            </span>
            {!approved && <span className="badge badge-gray">Pendiente de aprobación</span>}
          </div>
          <h2 className="font-black text-[var(--verde2)] text-xl m-0">Revisión del contrato</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Los datos se llenaron con tu expediente. No vuelvas a capturarlos. Solo ves tu PDF personalizado, nunca la plantilla fuente.
          </p>
          <div className="contract whitespace-pre-wrap font-serif text-sm leading-7 max-h-[420px] overflow-auto border border-[var(--line)] rounded-xl p-4 mt-4 bg-[#fbfaf6]">
            {filledBody}
          </div>
        </div>
      </article>

      <article className="card p-5 sm:p-6 grid gap-3">
        <h3 className="font-bold text-[var(--verde2)] m-0">Firma</h3>
        <p className="text-sm text-[var(--muted)]">
          Dibuja tu firma y confírmala para dejarla registrada en el expediente.
        </p>
        <SignaturePad onChange={setPreview} />
        {signatureDraftAt && (
          <p className="text-xs text-[var(--muted)]">
            Firma recibida el {new Date(signatureDraftAt).toLocaleString("es-MX")}.
          </p>
        )}
        {err && <div className="notice notice-red">{err}</div>}
        {msg && <div className="notice notice-green">{msg}</div>}
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-light" type="button" disabled={loading || !preview} onClick={confirmSignature}>
            Confirmar firma
          </button>
          <button className="btn btn-green" type="button" disabled={loading} onClick={generatePdf}>
            {loading ? "Generando…" : "Descargar mi PDF personalizado"}
          </button>
        </div>
        {pdfs.length > 0 && (
          <div className="grid gap-2 mt-2">
            <small className="font-bold text-[var(--muted)]">PDFs de tu expediente</small>
            {pdfs.map((d) => (
              <a key={d.id} className="text-sm font-bold text-[var(--verde)]" href={`/api/archivos/${d.id}`}>
                {d.fileName}
              </a>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

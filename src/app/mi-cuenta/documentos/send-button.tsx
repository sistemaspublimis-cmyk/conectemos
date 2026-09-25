"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SendDocumentsButton({
  missing,
  alreadySent,
}: {
  missing: string[];
  alreadySent?: boolean;
}) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const blocked = missing.length > 0;

  async function send() {
    setErr("");
    setLoading(true);
    const res = await fetch("/api/documentos/enviar", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "No se pudieron enviar los documentos.");
      return;
    }
    router.push("/mi-cuenta/valoracion");
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      {blocked && (
        <div className="notice notice-gold">
          Faltan documentos requeridos: {missing.join(", ")}. Cárgalos para enviar tu expediente a revisión.
        </div>
      )}
      {alreadySent && !blocked && (
        <div className="notice notice-green">Tus documentos ya fueron enviados. Puedes agregar archivos adicionales si te los solicitan.</div>
      )}
      {err && <div className="notice notice-red">{err}</div>}
      <button type="button" className="btn btn-green" disabled={loading || blocked} onClick={send}>
        {loading ? "Enviando..." : alreadySent ? "Enviar de nuevo a revisión" : "Enviar documentos"}
      </button>
    </div>
  );
}

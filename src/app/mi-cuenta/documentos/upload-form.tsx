"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { REQUIRED_DOC_TYPES } from "@/lib/process";

const CLIENT_DOC_TYPES = DOCUMENT_TYPES.filter((t) =>
  (REQUIRED_DOC_TYPES as readonly string[]).includes(t.value),
);

export function UploadForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/documentos", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setErr(data.error || "No se pudo subir");
    else {
      setMsg("Documento recibido. Aún no se envía a revisión.");
      e.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="field">
        Tipo
        <select name="type" required>
          {CLIENT_DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Archivo (puedes subir el archivo que tengas · máx. 10 MB)
        <input name="file" type="file" accept="*/*" required />
      </label>
      {err && <div className="notice notice-red">{err}</div>}
      {msg && <div className="notice notice-green">{msg}</div>}
      <button className="btn btn-green" disabled={loading}>
        {loading ? "Subiendo..." : "Subir documento"}
      </button>
    </form>
  );
}

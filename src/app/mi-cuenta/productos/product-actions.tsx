"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function BlockedNotice({ slug, message }: { slug: string; message: string }) {
  useEffect(() => {
    fetch("/api/productos/intento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  return <div className="notice notice-gold">{message}</div>;
}

export function ContratarButton({
  slug,
  label = "Contratar",
}: {
  slug: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function contratar() {
    setLoading(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/productos/contratar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
        return;
      }
      if (!res.ok) {
        setError(data.error || data.tapMessage || "No se pudo contratar.");
        setLoading(false);
        return;
      }
      setOk(data.already ? "Este producto ya está contratado." : "Producto contratado.");
      router.refresh();
    } catch {
      setError("No se pudo contratar.");
    }
    setLoading(false);
  }

  return (
    <div className="grid gap-2">
      {error && <div className="notice notice-red">{error}</div>}
      {ok && <div className="notice notice-green">{ok}</div>}
      <button type="button" className="btn btn-green" disabled={loading} onClick={contratar}>
        {loading ? "Procesando..." : label}
      </button>
    </div>
  );
}

export function NeedsBasicNotice() {
  return (
    <div className="notice notice-gold grid gap-3">
      <div>
        Para contratar este producto primero debes tener una <b>cuenta básica</b> contratada. Es el expediente digital
        con el que la financiera te identifica.
      </div>
      <Link href="/mi-cuenta/productos/cuenta-basica" className="btn btn-gold" style={{ justifySelf: "start" }}>
        Ir a cuenta básica
      </Link>
    </div>
  );
}

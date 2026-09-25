"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_KIND_LABEL, PRODUCT_KINDS } from "@/lib/product-catalog";
import type { ProductKind } from "@prisma/client";

export type CatalogProductValues = {
  id?: string;
  name: string;
  slug: string;
  kind: ProductKind;
  summary: string;
  description: string;
  benefits: string;
  requirements: string;
  imageUrl: string;
  requiresBasicAccount: boolean;
  active: boolean;
  sortOrder: number;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductCatalogForm({ initial }: { initial?: CatalogProductValues | null }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [slug, setSlug] = useState(initial?.slug || "");

  const title = useMemo(
    () => (editing ? `Editar ${initial?.name || "producto"}` : "Crear producto"),
    [editing, initial?.name],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      kind: fd.get("kind"),
      summary: fd.get("summary"),
      description: fd.get("description"),
      benefits: fd.get("benefits"),
      requirements: fd.get("requirements"),
      imageUrl: fd.get("imageUrl"),
      requiresBasicAccount: fd.get("requiresBasicAccount") === "on",
      active: fd.get("active") === "on",
      sortOrder: fd.get("sortOrder"),
    };
    const res = await fetch(editing ? `/api/admin/productos/${initial?.id}` : "/api/admin/productos", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Error");
      return;
    }
    setMsg(editing ? "Producto actualizado." : "Producto creado.");
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 max-w-3xl">
      <h2 className="font-bold m-0">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="field">
          Nombre
          <input
            name="name"
            defaultValue={initial?.name || ""}
            required
            onChange={(e) => {
              if (!slugTouched) setSlug(toSlug(e.target.value));
            }}
          />
        </label>
        <label className="field">
          Slug
          <input
            name="slug"
            value={slug}
            required
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </label>
        <label className="field">
          Tipo
          <select name="kind" defaultValue={initial?.kind || "PERSONAL_CREDIT"}>
            {PRODUCT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {PRODUCT_KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Orden
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
        </label>
      </div>
      <label className="field">
        Resumen
        <input name="summary" defaultValue={initial?.summary || ""} />
      </label>
      <label className="field">
        Descripción
        <textarea name="description" defaultValue={initial?.description || ""} />
      </label>
      <label className="field">
        Beneficios
        <textarea name="benefits" defaultValue={initial?.benefits || ""} />
      </label>
      <label className="field">
        Requisitos
        <textarea name="requirements" defaultValue={initial?.requirements || ""} />
      </label>
      <label className="field">
        URL de imagen
        <input name="imageUrl" defaultValue={initial?.imageUrl || ""} />
      </label>
      <div className="flex flex-wrap gap-4 text-xs">
        <label>
          <input
            type="checkbox"
            name="requiresBasicAccount"
            defaultChecked={initial?.requiresBasicAccount ?? true}
          />{" "}
          Requiere cuenta básica
        </label>
        <label>
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} /> Activo
        </label>
      </div>
      {err && <div className="notice notice-red">{err}</div>}
      {msg && <div className="notice notice-green">{msg}</div>}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-green">{editing ? "Guardar cambios" : "Crear producto"}</button>
        {editing && (
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              router.push("/admin/productos");
            }}
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

export function ProductDeactivateButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!active) return <span className="text-[var(--muted)]">Inactivo</span>;

  async function deactivate() {
    setBusy(true);
    await fetch(`/api/admin/productos/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button className="btn btn-danger !py-2 text-xs" type="button" disabled={busy} onClick={deactivate}>
      Desactivar
    </button>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StaffForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/equipo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
        role: fd.get("role"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "No se pudo crear");
      return;
    }
    setMsg("Persona agregada. Ya puede entrar con su correo y contraseña.");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 grid sm:grid-cols-2 gap-3">
      <h2 className="sm:col-span-2 font-black text-[var(--verde2)] m-0">Agregar al equipo</h2>
      <p className="sm:col-span-2 text-sm text-[var(--muted)] m-0">
        El dueño da de alta gerentes y asesores. Cada uno entra con su propio correo y ve solo lo de su rol.
      </p>
      <label className="field">
        Nombre
        <input name="firstName" required />
      </label>
      <label className="field">
        Apellido
        <input name="lastName" required />
      </label>
      <label className="field">
        Correo
        <input name="email" type="email" required />
      </label>
      <label className="field">
        Teléfono
        <input name="phone" />
      </label>
      <label className="field">
        Contraseña
        <input name="password" type="password" required minLength={8} />
      </label>
      <label className="field">
        Rol
        <select name="role" required defaultValue="ADVISOR">
          <option value="ADVISOR">Asesor — atiende expedientes y avisos</option>
          <option value="MANAGER">Gerente — opera créditos, sin configuración</option>
          <option value="ADMIN">Dueño — ve y configura todo</option>
        </select>
      </label>
      {err && <div className="notice notice-red sm:col-span-2">{err}</div>}
      {msg && <div className="notice notice-green sm:col-span-2">{msg}</div>}
      <button className="btn btn-green sm:col-span-2" disabled={loading}>
        {loading ? "Guardando..." : "Agregar persona"}
      </button>
    </form>
  );
}

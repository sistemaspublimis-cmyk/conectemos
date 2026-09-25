import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { PerfilForm } from "./perfil-form";
import { StatusBadge } from "@/components/status-badge";

export default async function PerfilPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const u = ctx.client.user;
  return (
    <div>
      <h1 className="text-2xl font-black text-[var(--verde2)]">
        Mi perfil
      </h1>
      <div className="card p-5 mt-4 grid gap-2 text-sm">
        <p>
          <b>Nombre:</b> {u.firstName} {u.lastName}
        </p>
        <p>
          <b>Correo:</b> {u.email}
        </p>
        <p>
          <b>Folio:</b> {ctx.client.folio}
        </p>
        <p>
          <b>Estado:</b> <StatusBadge status={u.status} />
        </p>
      </div>
      <div className="card p-5 mt-4">
        <PerfilForm phone={u.phone || ""} whatsapp={u.whatsapp || ""} />
      </div>
    </div>
  );
}

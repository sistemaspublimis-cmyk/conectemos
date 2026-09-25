"use client";

import { useRouter } from "next/navigation";

export function MarkRead({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      className="btn btn-light !py-1 text-xs mt-2"
      onClick={async () => {
        await fetch(`/api/notificaciones/${id}/leer`, { method: "POST" });
        router.refresh();
      }}
    >
      Marcar como leída
    </button>
  );
}

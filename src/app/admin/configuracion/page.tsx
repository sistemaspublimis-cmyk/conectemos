import { gmailConfigured } from "@/lib/email";
import { whatsappConfigured } from "@/lib/whatsapp";
import { PendingNotice } from "@/components/pending-notice";

export default function ConfigPage() {
  return (
    <div>
      <h1 className="text-2xl font-black">Configuración</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <article className="card p-4">
          <h2 className="font-bold">Gmail</h2>
          {gmailConfigured() ? (
            <p className="notice notice-green mt-2">Integración configurada.</p>
          ) : (
            <PendingNotice>Define GMAIL_USER y GMAIL_APP_PASSWORD en .env</PendingNotice>
          )}
        </article>
        <article className="card p-4">
          <h2 className="font-bold">WhatsApp Business</h2>
          {whatsappConfigured() ? (
            <p className="notice notice-green mt-2">Cloud API configurada.</p>
          ) : (
            <PendingNotice title="WhatsApp no conectado">
              WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID y webhook /api/webhooks/whatsapp
            </PendingNotice>
          )}
        </article>
        <article className="card p-4">
          <h2 className="font-bold">Almacenamiento</h2>
          <p className="text-sm mt-2">Archivos locales en /uploads. No son públicos. Se sirven con autenticación.</p>
        </article>
        <article className="card p-4">
          <h2 className="font-bold">Base de datos</h2>
          <p className="text-sm mt-2">SQLite local por defecto. docker-compose.yml incluye PostgreSQL para producción.</p>
        </article>
      </div>
    </div>
  );
}

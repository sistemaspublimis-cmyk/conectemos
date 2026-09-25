import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

const FAQ = [
  [
    "¿Qué productos hay?",
    "Crédito personal, de nómina, PyME, automotriz, arrendamiento y factoraje. También cuenta, tarjeta de crédito, tarjeta empresarial, débito, cuenta empresarial, fondo de ahorro e inversiones. Elige el tuyo y pídelo.",
  ],
  [
    "¿En qué se diferencian el crédito personal, el de nómina y el PyME?",
    "El personal va de $50,000 a $1,000,000, de 6 a 48 meses, para personas de 20 a 60 años. El de nómina va de $50,000 a $500,000 si compruebas el empleo. El PyME llega hasta $10,000,000 para la operación del negocio. Arrendamiento y factoraje también llegan a $10,000,000.",
  ],
  [
    "¿Crédito automotriz o arrendamiento?",
    "El automotriz financia la compra de un auto nuevo o seminuevo de hasta 7 años, con enganche y plazo de 12 a 60 meses. El arrendamiento es para persona física con actividad empresarial o persona moral: usas el auto o el equipo de 12 a 48 meses y la opción de compra queda en el contrato, para el vencimiento.",
  ],
  [
    "¿Qué es el factoraje?",
    "Adelantas facturas de una venta que ya hiciste, cuando tu cliente paga a 30, 60 o 90 días. Recibes una parte hoy y el resto cuando cobran.",
  ],
  [
    "¿Para qué sirve la cuenta básica?",
    "Es tu relación con Conectemos: folio, historial y la puerta para pedir tarjeta, cuenta empresarial y lo demás.",
  ],
  [
    "¿Cuándo aparece el monto y la cuenta digital?",
    "En tu oferta, junto con el plazo y el pago. Desde tu cuenta das seguimiento, y cuando queda listo lo ves en la cuenta digital. El fondo de ahorro se suma en ese mismo momento.",
  ],
  [
    "¿Dónde quedan la tasa y el CAT?",
    "En la oferta que te presentamos, con el pago y el plazo, para que decidas con los números en la mano.",
  ],
  [
    "¿Qué documentos piden en casi todos los casos?",
    "Identificación oficial vigente, comprobante de domicilio de máximo 3 meses y comprobante de ingresos o estados de cuenta. El crédito personal y el de nómina piden CLABE. Negocio, arrendamiento y factoraje piden constancia de situación fiscal. El auto pide cotización o factura. El factoraje pide las facturas.",
  ],
  [
    "¿Qué edad necesito?",
    "En general, de 18 a 70 años. El crédito personal y el de nómina se solicitan de 20 a 60 años. En persona moral se identifica al representante.",
  ],
  [
    "¿Cómo sigo el trámite?",
    "Entras a tu cuenta. Ahí ves el estado del estudio, cargas o corriges documentos, consultas la oferta y firmas el contrato. Cada cambio de estado deja un aviso en el portal.",
  ],
  [
    "¿Cuánto tarda la revisión?",
    "En cuanto dejas el estudio y tus documentos, un asesor te presenta la oferta. Si falta una hoja, te lo marcamos en tu cuenta para que la sustituyas y sigas.",
  ],
  [
    "¿Cómo los contacto?",
    "El trámite se sigue en el portal, con tu folio. También puedes escribir a contacto@conectemos.mx desde la página de contacto.",
  ],
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="pub-page-hero">
          <div className="pub-wrap">
            <p className="pub-kicker">Preguntas frecuentes</p>
            <h1>Resuelve la duda y pide el tuyo.</h1>
            <p>Diferencias entre créditos, documentos y cómo recibes la oferta. Si ya sabes cuál quieres, pídelo directo.</p>
          </div>
        </section>
        <section className="pub-section">
          <div className="pub-wrap pub-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
            <p className="pub-faq-more">
              <Link href="/productos">Ver el catálogo</Link>
              <Link href="/requisitos">Ver requisitos</Link>
              <Link href="/contacto">Contacto</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

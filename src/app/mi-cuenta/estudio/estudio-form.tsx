"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AmountCalculator } from "@/components/client/amount-calculator";
import { StageLayout } from "@/components/client/stage-layout";
import { ZipFill } from "@/components/client/zip-fill";
import { formatMXN } from "@/lib/money";
import { STAGE_IMAGES, studySectionsComplete } from "@/lib/process";

type Study = Record<string, string | number | null | undefined>;

const WIZARD = [
  {
    key: "personal",
    label: "Datos personales",
    title: "Tus datos personales",
    why: "Necesitamos conocerte para integrar tu expediente de manera correcta, clara y confidencial.",
    nextHint: "Después continuaremos con tu información laboral.",
    image: STAGE_IMAGES.personal,
  },
  {
    key: "laboral",
    label: "Información laboral",
    title: "Tu actividad laboral",
    why: "Tu empleo, empresa e ingresos nos ayudan a entender tu situación actual con precisión.",
    nextHint: "Sigue el detalle de tus ingresos y gastos mensuales.",
    image: STAGE_IMAGES.laboral,
  },
  {
    key: "ingresos",
    label: "Ingresos y gastos",
    title: "Ingresos y gastos",
    why: "Un panorama claro de tu economía mensual permite una revisión más ordenada de tu solicitud.",
    nextHint: "Elige el monto y el plazo que tienes en mente.",
    image: STAGE_IMAGES.ingresos,
  },
  {
    key: "monto",
    label: "Monto",
    title: "Monto y plazo",
    why: "Ajusta el financiamiento que buscas. La mensualidad se calcula al momento; la tasa final se confirma en tu oferta.",
    nextHint: "Completaremos tu situación financiera actual.",
    image: STAGE_IMAGES.monto,
  },
  {
    key: "situacion",
    label: "Situación financiera",
    title: "Situación financiera",
    why: "Créditos, deudas y referencias dan contexto adicional a tu expediente. Si no aplica, puedes indicar “Ninguno”.",
    nextHint: "Revisarás un resumen y enviarás tu estudio.",
    image: STAGE_IMAGES.situacion,
  },
  {
    key: "revision",
    label: "Revisión",
    title: "Revisa y envía tu estudio",
    why: "Confirma que la información sea correcta. En el siguiente paso te pediremos documentos de respaldo.",
    nextHint: "Cargarás identificación oficial, comprobante de domicilio e ingresos.",
    image: STAGE_IMAGES.revision,
  },
] as const;

function firstIncompleteStep(initial: Study, submitted: boolean) {
  const sections = studySectionsComplete(initial);
  if (!sections.personal) return 0;
  if (!sections.laboral) return 1;
  if (!sections.ingresos) return 2;
  if (!sections.monto) return 3;
  if (!sections.situacion && !submitted) return 4;
  return 5;
}

function readNumber(form: HTMLFormElement, name: string) {
  const raw = String(new FormData(form).get(name) || "").replace(/[$,\s]/g, "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function applyCreditFields(fd: FormData) {
  const has = String(fd.get("hasActiveCredits") || "");
  if (has === "No") {
    fd.set("currentCredits", "Ninguno");
    fd.set("autoCredits", "Ninguno");
  } else if (has === "Sí") {
    const bits: string[] = [];
    const push = (flag: string, label: string, company: string, amount: string) => {
      if (String(fd.get(flag)) !== "Sí") return;
      const who = String(fd.get(company) || "").trim() || "s/d";
      const howMuch = String(fd.get(amount) || "").trim() || "s/d";
      bits.push(`${label}: ${who} · ${howMuch}`);
    };
    push("hasAutoCredit", "Crédito automotriz", "autoCompany", "autoAmount");
    push("hasCardCredit", "Tarjeta de crédito", "cardCompany", "cardAmount");
    push("hasHomeCredit", "Crédito de hogar", "homeCompany", "homeAmount");
    push("hasPayrollCredit", "Crédito de nómina", "payrollCompany", "payrollAmount");
    push("hasPersonalCredit", "Crédito personal", "personalCompany", "personalAmount");
    fd.set("currentCredits", bits.join("; ") || "Sí");
    fd.set("autoCredits", String(fd.get("hasAutoCredit")) === "Sí" ? bits.find((b) => b.startsWith("Crédito automotriz")) || "Sí" : "Ninguno");
  }
  if (String(fd.get("hasOtherDebts")) === "No") fd.set("debts", "Ninguna");
  else if (String(fd.get("hasOtherDebts")) === "Sí") fd.set("debts", String(fd.get("debtsDetail") || "Sí"));
}

function unifiedExpenseValue(initial: Study) {
  const direct = Number(initial.monthlyExpenses);
  if (Number.isFinite(direct) && direct > 0) return String(direct);
  const sum = ["housingExpense", "foodExpense", "utilitiesExpense", "transportExpense"]
    .map((key) => Number(initial[key]) || 0)
    .reduce((acc, n) => acc + n, 0);
  return sum > 0 ? String(sum) : "";
}

export function EstudioForm({ initial, submitted = false }: { initial: Study; submitted?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(() => firstIncompleteStep(initial, submitted));
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<Study>(initial);
  const [knowsBureau, setKnowsBureau] = useState(() => String(initial.knowsBureau || ""));
  const [expenseSeed] = useState(() => unifiedExpenseValue(initial));
  const [amount, setAmount] = useState(() => {
    const n = Number(initial.requestedAmount);
    return Number.isFinite(n) && n >= 10000 ? n : 50000;
  });
  const [termMonths, setTermMonths] = useState(() => {
    const n = Number(initial.termMonths);
    return [12, 24, 36, 48, 60].includes(n) ? n : 24;
  });

  const v = (k: string) => (snapshot[k] == null ? "" : String(snapshot[k]));

  function capture(form: HTMLFormElement) {
    const fd = new FormData(form);
    const next: Study = { ...snapshot };
    for (const [key, val] of fd.entries()) {
      if (key === "submit") continue;
      next[key] = String(val);
    }
    next.requestedAmount = amount;
    next.termMonths = termMonths;
    setSnapshot(next);
    return next;
  }
  const current = WIZARD[step];
  const last = step === WIZARD.length - 1;

  const checklist = useMemo(() => {
    const sections = studySectionsComplete({
      ...snapshot,
      requestedAmount: amount,
      termMonths,
    });
    return [
      { key: "personal", label: "Datos personales", done: sections.personal },
      { key: "laboral", label: "Información laboral", done: sections.laboral },
      { key: "ingresos", label: "Ingresos y gastos", done: sections.ingresos },
      { key: "monto", label: "Monto y plazo", done: sections.monto },
      { key: "situacion", label: "Situación financiera", done: sections.situacion },
    ];
  }, [snapshot, amount, termMonths]);

  function validateStep(form: HTMLFormElement, index: number) {
    const fd = new FormData(form);
    const val = (name: string) => String(fd.get(name) || "").trim();
    if (index === 0) {
      if (!val("fullName") || !val("birthDate") || !val("address") || !val("city")) {
        return "Completa nombre, fecha de nacimiento, domicilio y ciudad para continuar.";
      }
    }
    if (index === 1) {
      if (!val("employmentType") || !val("company") || readNumber(form, "monthlyIncome") <= 0) {
        return "Completa tipo de empleo, empresa e ingreso mensual para continuar.";
      }
    }
    if (index === 2) {
      const monthly = readNumber(form, "monthlyExpenses");
      const extras = ["housingExpense", "foodExpense", "utilitiesExpense", "transportExpense", "creditExpense", "otherExpense"];
      const hasExpense = monthly > 0 || extras.some((name) => readNumber(form, name) > 0);
      if (readNumber(form, "monthlyIncome") <= 0 || !hasExpense) {
        return "Indica tu ingreso mensual y tus gastos mensuales de vivienda, alimentación, servicios y transporte.";
      }
    }
    if (index === 3) {
      if (!(amount > 0) || !termMonths) return "Selecciona un monto y un plazo.";
    }
    if (index === 4) {
      if (!val("knowsBureau")) return "Indica si conoces tu estatus de buró de crédito.";
      if (!val("hasActiveCredits")) return "Indica si tienes créditos activos.";
      if (val("hasActiveCredits") === "Sí") {
        const types = ["hasAutoCredit", "hasCardCredit", "hasHomeCredit", "hasPayrollCredit", "hasPersonalCredit"];
        if (!types.some((name) => val(name) === "Sí")) {
          return "Si tienes créditos activos, indica de qué tipo (auto, tarjeta, hogar, nómina o personal).";
        }
      }
      if (!val("hasOtherDebts")) return "Indica si tienes otras deudas.";
      if (val("hasOtherDebts") === "Sí" && !val("debtsDetail")) {
        return "Si tienes otras deudas, indica de qué se trata y un monto aproximado.";
      }
    }
    return "";
  }

  async function send(form: HTMLFormElement, submit: boolean) {
    setLoading(true);
    setErr("");
    const fd = new FormData(form);
    applyCreditFields(fd);
    fd.set("requestedAmount", String(amount));
    fd.set("termMonths", String(termMonths));
    fd.set("submit", submit ? "1" : "0");
    const res = await fetch("/api/estudio", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "No se pudo guardar");
      return false;
    }
    capture(form);
    setMsg(submit ? "Estudio enviado." : "Borrador guardado.");
    router.refresh();
    if (submit) router.push("/mi-cuenta/estudio/completado");
    return true;
  }

  async function onContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (last) {
      const missing =
        validateStep(form, 0) ||
        validateStep(form, 1) ||
        validateStep(form, 2) ||
        validateStep(form, 3) ||
        validateStep(form, 4);
      if (missing) {
        setErr(missing);
        return;
      }
      await send(form, true);
      return;
    }
    const issue = validateStep(form, step);
    if (issue) {
      setErr(issue);
      return;
    }
    const ok = await send(form, false);
    if (ok) {
      setErr("");
      setMsg("");
      setStep((s) => Math.min(s + 1, WIZARD.length - 1));
    }
  }

  return (
    <form className="grid gap-5" onSubmit={onContinue}>
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-5">
        <aside className="card p-4 h-fit">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)] mb-3">Secciones</p>
          <ol className="grid gap-2">
            {checklist.map((item, index) => (
              <li key={item.key} className="flex items-center gap-2 text-sm">
                <span
                  className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-black ${
                    item.done ? "bg-[#e8f5e9] text-[var(--ok)]" : step === index ? "bg-[var(--verde)] text-white" : "bg-[#eef1f0] text-[var(--muted)]"
                  }`}
                >
                  {item.done ? "✓" : index + 1}
                </span>
                <span className={item.done ? "text-[var(--verde2)] font-bold" : ""}>{item.label}</span>
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm">
              <span
                className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-black ${
                  submitted ? "bg-[#e8f5e9] text-[var(--ok)]" : last ? "bg-[var(--verde)] text-white" : "bg-[#eef1f0] text-[var(--muted)]"
                }`}
              >
                {submitted ? "✓" : 6}
              </span>
              <span>Enviar estudio</span>
            </li>
          </ol>
        </aside>

        <div>
          <div className={step === 0 ? "" : "hidden"}>
            <StageLayout image={WIZARD[0].image} eyebrow="Estudio socioeconómico" title={WIZARD[0].title} why={WIZARD[0].why} nextHint={WIZARD[0].nextHint}>
              <section className="card p-5 grid sm:grid-cols-2 gap-3">
                <label className="field">
                  Nombre
                  <input name="fullName" defaultValue={v("fullName")} placeholder="Ej. María Fernanda López Ruiz" />
                </label>
                <label className="field">
                  Fecha de nacimiento
                  <input name="birthDate" type="date" defaultValue={v("birthDate")} placeholder="Ej. 1990-05-15" />
                </label>
                <label className="field">
                  Estado civil
                  <select name="maritalStatus" defaultValue={v("maritalStatus")}>
                    <option value="">Seleccionar</option>
                    <option>Soltero/a</option>
                    <option>Casado/a</option>
                    <option>Unión libre</option>
                    <option>Divorciado/a</option>
                    <option>Viudo/a</option>
                  </select>
                </label>
                <label className="field">
                  Dependientes
                  <input name="dependents" type="number" min="0" defaultValue={v("dependents")} placeholder="Ej. 2" />
                </label>
                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
                  <ZipFill
                    defaultZip={v("zip")}
                    defaultState={v("state")}
                    defaultCity={v("city")}
                    defaultNeighborhood={v("neighborhood")}
                  />
                </div>
                <label className="field sm:col-span-2">
                  Domicilio (residencia actual)
                  <input name="address" defaultValue={v("address")} placeholder="Calle, número, interior" />
                  <small className="text-[11px] text-[var(--muted)] font-normal">
                    Debe ser el domicilio donde vives actualmente, no uno anterior.
                  </small>
                </label>
                <label className="field">
                  Tipo de vivienda
                  <select name="housingType" defaultValue={v("housingType")}>
                    <option value="">Seleccionar</option>
                    <option>Propia</option>
                    <option>Rentada</option>
                    <option>Familiar</option>
                  </select>
                </label>
              </section>
            </StageLayout>
          </div>

          <div className={step === 1 ? "" : "hidden"}>
            <StageLayout image={WIZARD[1].image} eyebrow="Estudio socioeconómico" title={WIZARD[1].title} why={WIZARD[1].why} nextHint={WIZARD[1].nextHint}>
              <section className="card p-5 grid sm:grid-cols-2 gap-3">
                <label className="field">
                  Tipo de empleo
                  <select name="employmentType" defaultValue={v("employmentType")}>
                    <option value="">Seleccionar</option>
                    <option>Asalariado</option>
                    <option>Independiente / Honorarios</option>
                    <option>Empresario</option>
                    <option>Actividad informal</option>
                    <option>Jubilado / Pensionado</option>
                    <option>Otro</option>
                    {v("employmentType") &&
                    !["Asalariado", "Independiente / Honorarios", "Empresario", "Actividad informal", "Jubilado / Pensionado", "Otro"].includes(v("employmentType")) ? (
                      <option value={v("employmentType")}>{v("employmentType")}</option>
                    ) : null}
                  </select>
                </label>
                <label className="field">
                  Empresa
                  <input name="company" defaultValue={v("company")} placeholder="Ej. Comercializadora del Valle" />
                </label>
                <label className="field">
                  Puesto
                  <input name="position" defaultValue={v("position")} placeholder="Ej. Analista de operaciones" />
                </label>
                <label className="field">
                  Antigüedad
                  <input name="seniority" defaultValue={v("seniority")} placeholder="Ej. 3 años 6 meses" />
                </label>
                <label className="field">
                  Ingreso mensual
                  <input name="monthlyIncome" defaultValue={v("monthlyIncome")} inputMode="decimal" placeholder="Ej. 18500" />
                </label>
                <label className="field">
                  Otros ingresos
                  <input name="otherIncome" defaultValue={v("otherIncome")} inputMode="decimal" placeholder="Ej. 2000" />
                </label>
              </section>
            </StageLayout>
          </div>

          <div className={step === 2 ? "" : "hidden"}>
            <StageLayout image={WIZARD[2].image} eyebrow="Estudio socioeconómico" title={WIZARD[2].title} why={WIZARD[2].why} nextHint={WIZARD[2].nextHint}>
              <section className="card p-5 grid sm:grid-cols-2 gap-3">
                <label className="field sm:col-span-2">
                  Gastos mensuales de vivienda, alimentación, servicios y transporte
                  <input name="monthlyExpenses" defaultValue={expenseSeed} inputMode="decimal" placeholder="Ej. 12500" />
                  <small className="text-[11px] text-[var(--muted)] font-normal">
                    Suma renta o hipoteca, comida, luz/agua/internet y transporte.
                  </small>
                </label>
                <label className="field">
                  Créditos
                  <input name="creditExpense" defaultValue={v("creditExpense")} inputMode="decimal" placeholder="Ej. 3500" />
                </label>
                <label className="field">
                  Otros gastos
                  <input name="otherExpense" defaultValue={v("otherExpense")} inputMode="decimal" placeholder="Ej. 800" />
                </label>
              </section>
            </StageLayout>
          </div>

          <div className={step === 3 ? "" : "hidden"}>
            <StageLayout image={WIZARD[3].image} eyebrow="Estudio socioeconómico" title={WIZARD[3].title} why={WIZARD[3].why} nextHint={WIZARD[3].nextHint}>
              <AmountCalculator amount={amount} termMonths={termMonths} onAmountChange={setAmount} onTermChange={setTermMonths} />
              <input type="hidden" name="requestedAmount" value={amount} />
              <input type="hidden" name="termMonths" value={termMonths} />
              <PurposeField defaultValue={v("purpose")} />
            </StageLayout>
          </div>

          <div className={step === 4 ? "" : "hidden"}>
            <StageLayout image={WIZARD[4].image} eyebrow="Estudio socioeconómico" title={WIZARD[4].title} why={WIZARD[4].why} nextHint={WIZARD[4].nextHint}>
              <FinanceSituation
                knowsBureau={knowsBureau}
                setKnowsBureau={setKnowsBureau}
                initial={snapshot}
              />
            </StageLayout>
          </div>

          <div className={step === 5 ? "" : "hidden"}>
            <StageLayout image={WIZARD[5].image} eyebrow="Estudio socioeconómico" title={WIZARD[5].title} why={WIZARD[5].why} nextHint={WIZARD[5].nextHint}>
              <section className="card p-5 grid gap-3 text-sm">
                <h2 className="font-bold text-[var(--verde2)]">Resumen</h2>
                <p><b>Nombre:</b> {v("fullName") || "—"}</p>
                <p><b>Ciudad:</b> {v("city") || "—"}</p>
                <p><b>Empleo:</b> {v("employmentType") || "—"} · {v("company") || "—"}</p>
                <p><b>Ingreso mensual:</b> {v("monthlyIncome") ? formatMXN(v("monthlyIncome")) : "—"}</p>
                <p><b>Gastos mensuales:</b> {v("monthlyExpenses") ? formatMXN(v("monthlyExpenses")) : "—"}</p>
                <p><b>Monto solicitado:</b> {formatMXN(amount)} a {termMonths} meses</p>
                <p className="text-[var(--muted)] text-xs">
                  Si necesitas corregir algún dato, usa Atrás. El envío guarda el estudio y continúa con documentos.
                </p>
              </section>
            </StageLayout>
          </div>
        </div>
      </div>

      {err && <div className="notice notice-red">{err}</div>}
      {msg && !last && <div className="notice notice-green">{msg}</div>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-light"
          disabled={loading || step === 0}
          onClick={() => {
            setErr("");
            setMsg("");
            setStep((s) => Math.max(0, s - 1));
          }}
        >
          Atrás
        </button>
        <button
          type="button"
          className="btn btn-light"
          disabled={loading}
          onClick={(ev) => {
            const form = (ev.currentTarget as HTMLButtonElement).form;
            if (form) send(form, false);
          }}
        >
          Guardar borrador
        </button>
        <button className="btn btn-green ml-auto" disabled={loading}>
          {loading ? "Guardando..." : last ? "Enviar estudio" : "Continuar"}
        </button>
      </div>
      <p className="text-[11px] text-[var(--muted)]">
        Sección {step + 1} de {WIZARD.length} · {current.label}
      </p>
    </form>
  );
}

const PURPOSE_OPTIONS = [
  "Préstamo personal",
  "Autofinanciamiento",
  "Crédito de hogar",
  "Crédito automotriz",
  "Capital de trabajo",
  "Gastos médicos",
  "Educación",
  "Consolidación de deudas",
  "Otro",
];

function PurposeField({ defaultValue }: { defaultValue: string }) {
  const known = PURPOSE_OPTIONS.includes(defaultValue) ? defaultValue : defaultValue ? "Otro" : "";
  const [purpose, setPurpose] = useState(known);
  const [other, setOther] = useState(known === "Otro" || (defaultValue && !PURPOSE_OPTIONS.includes(defaultValue)) ? defaultValue.replace(/^Otro:\s*/, "") : "");
  const stored = purpose === "Otro" ? (other.trim() ? `Otro: ${other.trim()}` : "Otro") : purpose;
  return (
    <div className="card p-5 grid gap-3">
      <label className="field">
        ¿Para qué lo quieres?
        <select name="purposeSelect" value={purpose} onChange={(e) => setPurpose(e.target.value)} required>
          <option value="">Seleccionar</option>
          {PURPOSE_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
      {purpose === "Otro" && (
        <label className="field">
          Especifica el motivo
          <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Describe el motivo" />
        </label>
      )}
      <input type="hidden" name="purpose" value={stored} />
    </div>
  );
}

function yesNoFrom(text: string) {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return "";
  if (["ninguno", "ninguna", "no", "n/a", "na"].includes(t)) return "No";
  return "Sí";
}

function YesNo({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold text-[var(--verde2)]">{label}</legend>
      <div className="flex gap-2">
        {["Sí", "No"].map((opt) => (
          <label
            key={opt}
            className={`flex-1 text-center rounded-xl border px-3 py-2 text-sm font-extrabold cursor-pointer ${
              value === opt ? "bg-[var(--verde)] text-white border-[var(--verde)]" : "bg-white border-[var(--line)]"
            }`}
          >
            <input type="radio" className="sr-only" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CreditDetail({
  namePrefix,
  title,
  defaultCompany,
  defaultAmount,
}: {
  namePrefix: string;
  title: string;
  defaultCompany?: string;
  defaultAmount?: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 rounded-xl bg-[#f4f8fa] p-3">
      <p className="sm:col-span-2 text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">{title}</p>
      <label className="field">
        ¿Con cuál empresa?
        <input name={`${namePrefix}Company`} defaultValue={defaultCompany} placeholder="Ej. Banorte, Toyota, Infonavit" />
      </label>
      <label className="field">
        Monto aproximado
        <input name={`${namePrefix}Amount`} defaultValue={defaultAmount} inputMode="decimal" placeholder="Ej. 80000" />
      </label>
    </div>
  );
}

function FinanceSituation({
  knowsBureau,
  setKnowsBureau,
  initial,
}: {
  knowsBureau: string;
  setKnowsBureau: (v: string) => void;
  initial: Study;
}) {
  const [hasCredits, setHasCredits] = useState(() => yesNoFrom(String(initial.currentCredits || "")));
  const [auto, setAuto] = useState(() => yesNoFrom(String(initial.autoCredits || "")));
  const [card, setCard] = useState("");
  const [home, setHome] = useState("");
  const [payroll, setPayroll] = useState("");
  const [personal, setPersonal] = useState("");
  const [hasDebts, setHasDebts] = useState(() => yesNoFrom(String(initial.debts || "")));

  const creditsSummary =
    hasCredits === "No"
      ? "Ninguno"
      : hasCredits === "Sí"
        ? [
            auto === "Sí" ? "Crédito automotriz" : "",
            card === "Sí" ? "Tarjeta de crédito" : "",
            home === "Sí" ? "Crédito de hogar" : "",
            payroll === "Sí" ? "Crédito de nómina" : "",
            personal === "Sí" ? "Crédito personal" : "",
          ]
            .filter(Boolean)
            .join("; ") || "Sí"
        : "";

  return (
    <section className="card p-5 grid gap-5">
      <label className="field">
        ¿Conoces tu estatus de buró de crédito?
        <select name="knowsBureau" value={knowsBureau} onChange={(e) => setKnowsBureau(e.target.value)}>
          <option value="">Seleccionar</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
          <option value="No estoy seguro">No estoy seguro</option>
        </select>
      </label>
      {knowsBureau === "Sí" && (
        <label className="field">
          ¿Cuál consideras que es?
          <select name="bureauStatus" defaultValue={String(initial.bureauStatus || "")}>
            <option value="">Seleccionar</option>
            <option>Bueno</option>
            <option>Regular</option>
            <option>Malo</option>
            <option>No lo sé</option>
          </select>
        </label>
      )}

      <YesNo name="hasActiveCredits" label="¿Tienes créditos activos?" value={hasCredits} onChange={setHasCredits} />
      {hasCredits === "Sí" && (
        <div className="grid gap-4">
          <p className="text-xs text-[var(--muted)]">
            Si respondes que no en un tipo, no te pedimos más datos de ese crédito.
          </p>
          <YesNo name="hasAutoCredit" label="¿Tienes crédito de autos?" value={auto} onChange={setAuto} />
          {auto === "Sí" && <CreditDetail namePrefix="auto" title="Crédito automotriz" />}
          <YesNo name="hasCardCredit" label="¿Tienes tarjeta de crédito?" value={card} onChange={setCard} />
          {card === "Sí" && <CreditDetail namePrefix="card" title="Tarjeta de crédito" />}
          <YesNo name="hasHomeCredit" label="¿Tienes crédito de hogar o hipotecario?" value={home} onChange={setHome} />
          {home === "Sí" && <CreditDetail namePrefix="home" title="Crédito de hogar" />}
          <YesNo name="hasPayrollCredit" label="¿Tienes crédito de nómina?" value={payroll} onChange={setPayroll} />
          {payroll === "Sí" && <CreditDetail namePrefix="payroll" title="Crédito de nómina" />}
          <YesNo name="hasPersonalCredit" label="¿Tienes otro crédito personal?" value={personal} onChange={setPersonal} />
          {personal === "Sí" && <CreditDetail namePrefix="personal" title="Crédito personal" />}
        </div>
      )}

      <YesNo name="hasOtherDebts" label="¿Tienes otras deudas (familiar, tienda, etc.)?" value={hasDebts} onChange={setHasDebts} />
      {hasDebts === "Sí" && (
        <label className="field">
          ¿De qué se trata y aproximadamente cuánto?
          <textarea name="debtsDetail" defaultValue={hasDebts === "Sí" ? String(initial.debts || "") : ""} placeholder="Ej. Préstamo familiar, $10,000" />
        </label>
      )}

      <label className="field">
        Referencias
        <textarea name="references" defaultValue={String(initial.references || "")} placeholder="Ej. Ana Pérez, hermana, 55 1234 5678" />
      </label>

      <input type="hidden" name="currentCredits" value={creditsSummary} />
      <input type="hidden" name="autoCredits" value={hasCredits === "No" || auto === "No" ? "Ninguno" : auto === "Sí" ? "Sí" : ""} />
      <input type="hidden" name="debts" value={hasDebts === "No" ? "Ninguna" : hasDebts === "Sí" ? "Sí" : ""} />
    </section>
  );
}

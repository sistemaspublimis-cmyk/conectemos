"use client";

import { useState } from "react";

export function ZipFill({
  defaultZip = "",
  defaultState = "",
  defaultCity = "",
  defaultNeighborhood = "",
}: {
  defaultZip?: string;
  defaultState?: string;
  defaultCity?: string;
  defaultNeighborhood?: string;
}) {
  const [zip, setZip] = useState(defaultZip);
  const [state, setState] = useState(defaultState);
  const [city, setCity] = useState(defaultCity);
  const [neighborhood, setNeighborhood] = useState(defaultNeighborhood);
  const [colonias, setColonias] = useState<string[]>(defaultNeighborhood ? [defaultNeighborhood] : []);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 5);
    setZip(clean);
    if (clean.length !== 5) {
      setColonias([]);
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/cp/${clean}`);
      const data = await res.json();
      if (!res.ok) {
        setMsg("No encontramos ese código postal. Escribe municipio, estado y colonia.");
        setColonias([]);
        return;
      }
      if (data.state) setState(data.state);
      if (data.municipality) setCity(data.municipality);
      const list: string[] = Array.isArray(data.neighborhoods) ? data.neighborhoods.filter(Boolean) : [];
      if (!list.length && data.neighborhood) list.push(data.neighborhood);
      setColonias(list);
      if (list.length === 1) {
        setNeighborhood(list[0]);
        setMsg(`${data.municipality || "Municipio"} · ${data.state || ""}. Confirma tu colonia.`);
      } else if (list.length > 1) {
        setNeighborhood((current) => (list.includes(current) ? current : ""));
        setMsg(`Encontramos ${list.length} colonias o localidades para este CP. Elige la tuya.`);
      } else {
        setMsg("Estado y municipio se llenaron. Escribe tu colonia.");
      }
    } catch {
      setMsg("No se pudo consultar el código postal. Llena municipio, estado y colonia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <label className="field">
        Código postal
        <input
          name="zip"
          value={zip}
          inputMode="numeric"
          maxLength={5}
          placeholder="Ej. 54948"
          onChange={(e) => lookup(e.target.value)}
        />
        <small className="text-[11px] text-[var(--muted)] font-normal">
          {loading ? "Confirmando código postal..." : "Al escribir 5 dígitos se confirman estado, municipio y colonias."}
        </small>
      </label>
      <label className="field">
        Estado
        <input name="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Ej. Estado de México" />
      </label>
      <label className="field">
        Municipio / alcaldía
        <input name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej. Tultitlán" />
      </label>
      <label className="field">
        Colonia o localidad
        {colonias.length > 1 ? (
          <select name="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}>
            <option value="">Selecciona tu colonia</option>
            {colonias.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Ej. Bello Horizonte"
            list="cp-colonias"
          />
        )}
        {colonias.length === 1 ? (
          <datalist id="cp-colonias">
            {colonias.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        ) : null}
      </label>
      {msg && <p className="sm:col-span-2 text-xs text-[var(--muted)]">{msg}</p>}
    </>
  );
}

const STATE_BY_PREFIX: Record<string, string> = {
  "01": "Ciudad de México",
  "02": "Ciudad de México",
  "03": "Ciudad de México",
  "04": "Ciudad de México",
  "05": "Ciudad de México",
  "06": "Ciudad de México",
  "07": "Ciudad de México",
  "08": "Ciudad de México",
  "09": "Ciudad de México",
  "10": "Ciudad de México",
  "11": "Ciudad de México",
  "12": "Ciudad de México",
  "13": "Ciudad de México",
  "14": "Ciudad de México",
  "15": "Ciudad de México",
  "16": "Ciudad de México",
  "20": "Aguascalientes",
  "21": "Baja California",
  "22": "Baja California",
  "23": "Baja California Sur",
  "24": "Campeche",
  "25": "Coahuila",
  "26": "Coahuila",
  "27": "Coahuila",
  "28": "Colima",
  "29": "Chiapas",
  "30": "Chiapas",
  "31": "Chihuahua",
  "32": "Chihuahua",
  "33": "Chihuahua",
  "34": "Durango",
  "35": "Durango",
  "36": "Guanajuato",
  "37": "Guanajuato",
  "38": "Guanajuato",
  "39": "Guerrero",
  "40": "Guerrero",
  "41": "Guerrero",
  "42": "Hidalgo",
  "43": "Hidalgo",
  "44": "Jalisco",
  "45": "Jalisco",
  "46": "Jalisco",
  "47": "Jalisco",
  "48": "Jalisco",
  "49": "Jalisco",
  "50": "Estado de México",
  "51": "Estado de México",
  "52": "Estado de México",
  "53": "Estado de México",
  "54": "Estado de México",
  "55": "Estado de México",
  "56": "Estado de México",
  "57": "Estado de México",
  "58": "Michoacán",
  "59": "Michoacán",
  "60": "Michoacán",
  "61": "Michoacán",
  "62": "Morelos",
  "63": "Nayarit",
  "64": "Nuevo León",
  "65": "Nuevo León",
  "66": "Nuevo León",
  "67": "Nuevo León",
  "68": "Oaxaca",
  "69": "Oaxaca",
  "70": "Oaxaca",
  "71": "Oaxaca",
  "72": "Puebla",
  "73": "Puebla",
  "74": "Puebla",
  "75": "Puebla",
  "76": "Querétaro",
  "77": "Quintana Roo",
  "78": "San Luis Potosí",
  "79": "San Luis Potosí",
  "80": "Sinaloa",
  "81": "Sinaloa",
  "82": "Sinaloa",
  "83": "Sonora",
  "84": "Sonora",
  "85": "Sonora",
  "86": "Tabasco",
  "87": "Tamaulipas",
  "88": "Tamaulipas",
  "89": "Tamaulipas",
  "90": "Tlaxcala",
  "91": "Veracruz",
  "92": "Veracruz",
  "93": "Veracruz",
  "94": "Veracruz",
  "95": "Veracruz",
  "96": "Veracruz",
  "97": "Yucatán",
  "98": "Zacatecas",
  "99": "Zacatecas",
};

export type CpLookup = {
  zip: string;
  state: string;
  municipality: string;
  neighborhood: string;
  neighborhoods: string[];
};

export function stateFromZip(zip: string): string {
  return STATE_BY_PREFIX[zip.slice(0, 2)] || "";
}

const MUNICIPALITY_BY_ZIP: Record<string, string> = {
  "03100": "Benito Juárez",
  "54900": "Tultitlán",
  "54948": "Tultitlán",
};

const MUNICIPALITY_RANGES: { from: number; to: number; municipality: string }[] = [
  { from: 3100, to: 3199, municipality: "Benito Juárez" },
  { from: 54900, to: 54959, municipality: "Tultitlán" },
];

function municipalityFromZip(zip: string): string {
  if (MUNICIPALITY_BY_ZIP[zip]) return MUNICIPALITY_BY_ZIP[zip];
  const n = Number(zip);
  if (!Number.isFinite(n)) return "";
  const hit = MUNICIPALITY_RANGES.find((r) => n >= r.from && n <= r.to);
  return hit?.municipality || "";
}

function uniqueNames(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const name = raw.replace(/\s+/g, " ").trim();
    if (!name) continue;
    const key = name.toLocaleLowerCase("es-MX");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

function municipalityFromDisplayName(display: string, zip: string, state: string) {
  const skip = new Set(
    [zip, "México", "Mexico", "MX", state, "Estado de México", "Mexico State", "CDMX", "Ciudad de México"]
      .map((s) => s.toLocaleLowerCase("es-MX")),
  );
  const parts = display
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !skip.has(p.toLocaleLowerCase("es-MX")));
  return parts[parts.length - 1] || parts[0] || "";
}

async function fetchJson(url: string, timeoutMs: number, headers?: HeadersInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal, headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function lookupMexicanZip(zip: string): Promise<CpLookup | null> {
  const clean = zip.replace(/\D/g, "").slice(0, 5);
  if (clean.length !== 5) return null;
  const state = stateFromZip(clean);
  let municipality = municipalityFromZip(clean);
  let neighborhoods: string[] = [];

  const [zippo, nominatim] = await Promise.all([
    fetchJson(`https://api.zippopotam.us/mx/${clean}`, 6000),
    fetchJson(
      `https://nominatim.openstreetmap.org/search?postalcode=${clean}&countrycodes=mx&format=json&addressdetails=1&limit=5`,
      6000,
      { "User-Agent": "Conectemos/1.0 (local demo)" },
    ),
  ]);

  if (zippo?.places?.length) {
    neighborhoods = uniqueNames(zippo.places.map((p: { ["place name"]?: string }) => String(p["place name"] || "")));
  }

  if (!municipality && Array.isArray(nominatim) && nominatim[0]?.display_name) {
    municipality = municipalityFromDisplayName(String(nominatim[0].display_name), clean, state);
  }

  if (!municipality && neighborhoods.length === 1) {
    municipality = neighborhoods[0];
  }

  const neighborhood = neighborhoods[0] || "";
  if (!state && !municipality && !neighborhood) return null;
  return { zip: clean, state, municipality, neighborhood, neighborhoods };
}

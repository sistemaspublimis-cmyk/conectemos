type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function resetRateLimits() {
  buckets.clear();
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  // En local no bloquea: se usa para pruebas y registro de clientes demo.
  if (process.env.NODE_ENV !== "production") return true;

  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

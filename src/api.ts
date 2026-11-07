export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch("/api" + path, { headers: { "Content-Type": "application/json" }, ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const d = data?.detail;
    const msg = typeof d === "string" ? d : Array.isArray(d) ? d.map((x: any) => x.msg).join("; ") : d?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}
export const post = (p: string, body?: unknown, method = "POST") => api(p, { method, body: body ? JSON.stringify(body) : undefined });

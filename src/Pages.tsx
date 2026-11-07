import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, post } from "./api";
import { Btn, Card, Empty, Err, MemBadge, Sev, inputCls } from "./ui";
import { InvResult, RecalledPanel } from "./Investigation";

const tip = { contentStyle: { background: "#0f172a", border: "1px solid #22304f" } };
const sevCol: Record<string, string> = { critical: "#f87171", high: "#fb923c", medium: "#facc15", low: "#94a3b8" };

export function Overview({ tick }: { tick: number }) {
  const [s, setS] = useState<any>(null); const [err, setErr] = useState("");
  useEffect(() => { api("/stats").then(setS).catch(e => setErr(e.message)); }, [tick]);
  if (err) return <Err msg={err} />; if (!s) return <Empty text="Loading…" />;
  const sev = ["critical", "high", "medium", "low"].map(k => ({ name: k, count: s.severity[k] || 0 }));
  const tiles = [["Incidents", s.incidents], ["Active", s.active], ["Resolved", s.resolved], ["Critical", s.critical]];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([k, v]) => <Card key={k as string}><div className="text-xs text-slate-500">{k}</div><div className="text-2xl font-bold text-slate-100">{v}</div></Card>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Severity">{s.incidents === 0 ? <Empty text="No incidents yet. Seed demo data from Memory Center or create one." /> :
          <div className="h-52"><ResponsiveContainer><BarChart data={sev}><CartesianGrid stroke="#22304f" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip {...tip} /><Bar dataKey="count">{sev.map(d => <Cell key={d.name} fill={sevCol[d.name]} />)}</Bar></BarChart></ResponsiveContainer></div>}</Card>
        <Card title="Hindsight memory stats (this app's activity)">
          <dl className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <dt>Incidents confirmed stored</dt><dd>{s.memory.stored}</dd><dt>Recalls</dt><dd>{s.memory.recalls}</dd>
            <dt>Recalls with hits</dt><dd>{s.memory.recalls_with_hits}</dd><dt>Failures</dt><dd>{s.memory.failures}</dd></dl></Card>
      </div>
      <Card title="Recent incidents">{s.recent.length === 0 ? <Empty text="Nothing yet." /> : s.recent.map((i: any) =>
        <div key={i.id} className="flex items-center justify-between border-b border-navy-700 py-2 text-sm text-slate-300 last:border-0"><span>{i.title}</span><span className="flex gap-2"><Sev s={i.severity} /><span className="text-slate-500">{i.status}</span></span></div>)}</Card>
    </div>
  );
}

export function Incidents({ tick }: { tick: number }) {
  const [list, setList] = useState<any[]>([]); const [q, setQ] = useState(""); const [sev, setSev] = useState(""); const [st, setSt] = useState("");
  const [open, setOpen] = useState<any>(null); const [err, setErr] = useState("");
  useEffect(() => { api(`/incidents?q=${encodeURIComponent(q)}&severity=${sev}&status=${st}`).then(setList).catch(e => setErr(e.message)); }, [q, sev, st, tick]);
  const show = (id: number) => api(`/incidents/${id}`).then(setOpen).catch(e => setErr(e.message));
  return (
    <div className="space-y-4">
      <Card><div className="grid gap-2 md:grid-cols-3">
        <input className={inputCls} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        <select className={inputCls} value={sev} onChange={e => setSev(e.target.value)}><option value="">All severities</option>{["critical", "high", "medium", "low"].map(s => <option key={s}>{s}</option>)}</select>
        <select className={inputCls} value={st} onChange={e => setSt(e.target.value)}><option value="">All statuses</option>{["open", "investigated", "resolved", "failed", "inconclusive"].map(s => <option key={s}>{s}</option>)}</select></div></Card>
      <Err msg={err} />
      <Card>{list.length === 0 ? <Empty text="No incidents match." /> : list.map(i =>
        <button key={i.id} onClick={() => show(i.id)} className="flex w-full items-center justify-between border-b border-navy-700 py-2 text-left text-sm text-slate-300 hover:bg-navy-800">
          <span>{i.title}</span><span className="flex gap-2"><Sev s={i.severity} /><span className="text-slate-500">{i.status}</span></span></button>)}</Card>
      {open && <Card title={open.title} right={<Btn kind="ghost" onClick={() => setOpen(null)}>Close</Btn>}>
        <p className="text-sm text-slate-300">{open.description}</p>
        <p className="mt-1 text-xs text-slate-500">Service: {open.service} · Source: {open.source} · Hindsight sync: {open.sync_status}{open.sync_error ? ` (${open.sync_error})` : ""}</p>
        {open.logs && <pre className="mt-2 overflow-x-auto rounded bg-navy-950 p-2 text-xs text-slate-400">{open.logs}</pre>}
        {open.outcome_json && <div className="mt-2 text-sm text-slate-300"><b>Outcome: {open.outcome}</b><br />Root cause: {open.outcome_json.actual_root_cause || "not confirmed"}<br />Verification: {open.outcome_json.verification_evidence || "—"}</div>}
        {open.investigation && <div className="mt-3 space-y-3"><RecalledPanel r={{ recalled: open.recalled, memory_status: open.memory_status }} /><InvResult r={{ investigation: open.investigation, memory_status: open.memory_status }} label="Saved investigation" /></div>}
      </Card>}
    </div>
  );
}

export function MemoryCenter({ onChange }: { onChange: () => void }) {
  const [h, setH] = useState<any>(null); const [hist, setHist] = useState<any>(null); const [st, setSt] = useState<any>(null);
  const [q, setQ] = useState("What patterns repeat in our payment incidents?"); const [refl, setRefl] = useState("");
  const [err, setErr] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState("");
  const load = () => { api("/health/hindsight").then(setH); api("/memory/history").then(setHist); api("/stats").then(setSt); };
  useEffect(load, []);
  const act = async (name: string, fn: () => Promise<any>) => {
    setBusy(name); setErr(""); setMsg("");
    try { const r = await fn(); setMsg(r?.label ? "" : JSON.stringify(r).slice(0, 300)); onChange(); load(); return r; } catch (e: any) { setErr(e.message); } finally { setBusy(""); }
  };
  return (
    <div className="space-y-4">
      <Card title="Hindsight connection">{h && <div className="flex items-center gap-3 text-sm text-slate-300">
        <MemBadge s={h.connected ? "MEMORY RETRIEVED" : "MEMORY SYNC FAILED"} /><span>{h.connected ? "Connected" : h.error}</span><span className="text-slate-500">bank: {h.bank_id}</span></div>}</Card>
      <Card title="Demo data"><p className="mb-2 text-sm text-slate-400">Inserts 4 labelled [DEMO SEED] incidents and retains them in Hindsight (real calls).</p>
        <Btn disabled={!!busy} onClick={() => { if (confirm("Insert 4 demo incidents and retain them in Hindsight?")) act("seed", () => post("/demo/seed")); }}>{busy === "seed" ? "Seeding…" : "Seed demo incidents"}</Btn></Card>
      <Card title="Stats (local counts of Hindsight operations)">{st && <p className="text-sm text-slate-300">Stored: {st.memory.stored} · Recalls: {st.memory.recalls} · With hits: {st.memory.recalls_with_hits} · Failures: {st.memory.failures}</p>}
        <div className="mt-2"><Btn kind="ghost" disabled={!!busy} onClick={() => act("sync", () => post("/memory/sync"))}>Retry sync of failed/pending</Btn></div></Card>
      <Card title="Reflect"><input className={inputCls} value={q} onChange={e => setQ(e.target.value)} />
        <div className="mt-2"><Btn disabled={!!busy} onClick={async () => { const r = await act("reflect", () => post("/memory/reflect", { query: q })); if (r) setRefl(r.text); }}>{busy === "reflect" ? "Reflecting…" : "Reflect"}</Btn></div>
        {refl && <div className="mt-3 rounded-lg bg-navy-950 p-3 text-sm text-slate-300"><div className="mb-1 text-[11px] font-bold uppercase text-sky-300">Hindsight-generated synthesis</div>{refl}</div>}</Card>
      <Err msg={err} />{msg && <div className="text-xs text-slate-400">{msg}</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Operation log (Hindsight)">{!hist || hist.operations.length === 0 ? <Empty text="No operations yet." /> : hist.operations.map((o: any) =>
          <div key={o.id} className="border-b border-navy-700 py-1 text-xs text-slate-300"><span className={o.ok ? "text-emerald-400" : "text-red-400"}>{o.ok ? "OK" : "FAIL"}</span> {o.op} {o.hits != null && `(${o.hits} hits)`} <span className="text-slate-500">{o.ts} {o.detail}</span></div>)}</Card>
        <Card title="Local SQLite sync records">{!hist || hist.local_sync_records.length === 0 ? <Empty text="No synced incidents." /> : hist.local_sync_records.map((i: any) =>
          <div key={i.id} className="border-b border-navy-700 py-1 text-xs text-slate-300">{i.title} — <b>{i.sync_status}</b></div>)}</Card>
      </div>
    </div>
  );
}

export function Analytics({ tick }: { tick: number }) {
  const [a, setA] = useState<any>(null);
  useEffect(() => { api("/analytics").then(setA); }, [tick]);
  if (!a) return <Empty text="Loading…" />;
  const bar = (title: string, d: any[]) => <Card title={title}>{d.every(x => !x.count) ? <Empty text="No data yet." /> :
    <div className="h-52"><ResponsiveContainer><BarChart data={d}><CartesianGrid stroke="#22304f" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip {...tip} /><Bar dataKey="count" fill="#38bdf8" /></BarChart></ResponsiveContainer></div>}</Card>;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {bar("By category", a.by_category)}{bar("By service", a.by_service)}{bar("Resolved vs failed", a.resolved_vs_failed)}
      <Card title="Over time">{a.over_time.length === 0 ? <Empty text="No data yet." /> :
        <div className="h-52"><ResponsiveContainer><LineChart data={a.over_time}><CartesianGrid stroke="#22304f" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip {...tip} /><Line dataKey="count" stroke="#38bdf8" /></LineChart></ResponsiveContainer></div>}</Card>
    </div>
  );
}

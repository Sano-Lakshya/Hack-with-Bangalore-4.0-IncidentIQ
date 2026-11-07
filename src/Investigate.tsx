import { useEffect, useState } from "react";
import { api, post } from "./api";
import { Btn, Card, Err, MemBadge, inputCls } from "./ui";
import { FeedbackForm, InvResult, RecalledPanel } from "./Investigation";

export default function Investigate({ onChange }: { onChange: () => void }) {
  const [scen, setScen] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", service: "", severity: "high", description: "", logs: "" });
  const [inc, setInc] = useState<any>(null);
  const [res, setRes] = useState<any>(null);
  const [noMem, setNoMem] = useState<any>(null);
  const [fb, setFb] = useState<any>(null);
  const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { api("/demo/scenarios").then(setScen).catch(() => {}); }, []);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const run = async (useMem: boolean, incident = inc) => {
    setErr(""); setBusy(useMem ? "Recalling from Hindsight, then investigating with Groq…" : "Investigating without memory…");
    try {
      const r = await post(`/incidents/${incident.id}/investigate?use_memory=${useMem}`);
      useMem ? setRes(r) : setNoMem(r); onChange();
    } catch (e: any) { setErr(e.message); } finally { setBusy(""); }
  };
  const start = async () => {
    setErr(""); setRes(null); setNoMem(null); setFb(null); setBusy("Normalizing incident…");
    try { const i = await post("/incidents", form); setInc(i); await run(true, i); } catch (e: any) { setErr(e.message); setBusy(""); }
  };

  return (
    <div className="space-y-4">
      <Card title="Demo scenarios">
        <div className="flex flex-wrap gap-2">{scen.map(s => <Btn key={s.id} kind="ghost" onClick={() => setForm({ title: s.title, service: s.service, severity: s.severity, description: s.description, logs: s.logs })}>{s.label} <span className="text-slate-500">(demo)</span></Btn>)}</div>
      </Card>
      <Card title="New incident">
        <div className="grid gap-2 md:grid-cols-3">
          <input className={inputCls} placeholder="Title" value={form.title} onChange={set("title")} />
          <input className={inputCls} placeholder="Service" value={form.service} onChange={set("service")} />
          <select className={inputCls} value={form.severity} onChange={set("severity")}>{["low", "medium", "high", "critical"].map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <textarea className={`${inputCls} mt-2`} rows={3} placeholder="Description / symptoms" value={form.description} onChange={set("description")} />
        <textarea className={`${inputCls} mt-2 font-mono text-xs`} rows={5} placeholder="Paste logs (treated as untrusted data)" value={form.logs} onChange={set("logs")} />
        <div className="mt-3 flex gap-2"><Btn onClick={start} disabled={!!busy}>Investigate</Btn></div>
      </Card>
      {busy && <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3 text-sm text-sky-300">{busy}</div>}
      <Err msg={err} />
      {res && (
        <>
          <RecalledPanel r={res} />
          <div className="grid gap-4 lg:grid-cols-2">
            <InvResult r={res} label="With Hindsight memory" />
            {noMem ? <InvResult r={noMem} label="Without memory (not saved)" /> :
              <Card title="Before / After"><p className="mb-3 text-sm text-slate-400">Re-run the same incident with recall disabled to see the generic answer. This run is not saved.</p>
                <Btn kind="ghost" onClick={() => run(false)} disabled={!!busy}>Run without memory</Btn></Card>}
          </div>
          {fb ? <Card title="Outcome recorded"><MemBadge s={fb.memory_status} />{fb.memory_error && <Err msg={fb.memory_error} />}
            <p className="mt-2 text-sm text-slate-400">Local record saved{fb.memory_status === "MEMORY STORED" ? " and confirmed by Hindsight." : "; Hindsight sync failed — retry from Memory Center."}</p></Card>
            : <FeedbackForm id={inc.id} onDone={r => { setFb(r); onChange(); }} />}
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { post } from "./api";
import { Btn, Card, Err, MemBadge, inputCls } from "./ui";

export function InvResult({ r, label }: { r: any; label: string }) {
  const i = r.investigation;
  return (
    <Card title={label} right={<MemBadge s={r.memory_status} />}>
      {r.memory_error && <Err msg={`Memory error: ${r.memory_error}`} />}
      <div className="space-y-3 text-sm text-slate-300">
        <p><b className="text-slate-100">Summary:</b> {i.incident_summary} <span className="text-slate-500">({i.category})</span></p>
        {i.observed_evidence?.length > 0 && <div><b className="text-slate-100">Observed evidence</b><ul className="ml-5 list-disc">{i.observed_evidence.map((e: string, k: number) => <li key={k}>{e}</li>)}</ul></div>}
        <div><b className="text-slate-100">Possible root causes (hypotheses, not confirmed)</b>
          <ul className="ml-5 list-disc">{i.possible_root_causes.map((c: any, k: number) => <li key={k}>{c.cause}<div className="text-xs text-slate-500">{c.supporting_evidence}</div></li>)}</ul></div>
        {i.historical_comparison && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3"><b className="text-emerald-300">Historical comparison</b><p>{i.historical_comparison}</p></div>}
        <div><b className="text-slate-100">Recommended actions (require human approval)</b>
          {i.recommended_actions.map((a: any, k: number) => (
            <div key={k} className="mt-2 rounded-lg border border-navy-700 p-2">
              <span className="mr-2 rounded bg-navy-700 px-1.5 py-0.5 text-[10px] uppercase">{a.type}</span>{a.action}
              <div className="text-xs text-slate-500">Why: {a.reason} · Risk: {a.risk} · Verify: {a.verification}</div></div>))}</div>
        <p className="text-xs text-slate-400"><b>Confidence:</b> {i.confidence_explanation}</p>
        {i.warnings?.map((w: string, k: number) => <div key={k} className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-amber-300">⚠ {w}</div>)}
      </div>
    </Card>
  );
}

export function RecalledPanel({ r }: { r: any }) {
  return (
    <Card title="Historical context from Hindsight" right={<MemBadge s={r.memory_status} />}>
      {r.recalled?.length ? r.recalled.map((m: any, k: number) => (
        <div key={k} className="mb-2 rounded-lg bg-navy-950 p-2 text-xs text-slate-300"><span className="mr-2 text-slate-500">[{m.type}]</span>{m.text}</div>
      )) : <div className="text-sm text-slate-500">{r.memory_status === "MEMORY SYNC FAILED" ? "Recall failed — see error above." : "No relevant memory was returned by Hindsight."}</div>}
      <p className="mt-2 text-[11px] text-slate-500">Recalled memory is context, not proof of the same root cause.</p>
    </Card>
  );
}

export function FeedbackForm({ id, onDone }: { id: number; onDone: (r: any) => void }) {
  const [f, setF] = useState({ outcome: "RESOLVED", actual_root_cause: "", actions_taken: "", verification_evidence: "", failed_attempts: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    setBusy(true); setErr("");
    try { onDone(await post(`/incidents/${id}/feedback`, f)); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <Card title="Record outcome (human-verified)">
      <div className="space-y-2">
        <select className={inputCls} value={f.outcome} onChange={set("outcome")}><option>RESOLVED</option><option>FAILED</option><option>INCONCLUSIVE</option></select>
        <textarea className={inputCls} rows={2} placeholder="Actual root cause (required for RESOLVED)" value={f.actual_root_cause} onChange={set("actual_root_cause")} />
        <textarea className={inputCls} rows={2} placeholder="Actions taken" value={f.actions_taken} onChange={set("actions_taken")} />
        <textarea className={inputCls} rows={2} placeholder="Verification evidence — metrics after the fix (required for RESOLVED)" value={f.verification_evidence} onChange={set("verification_evidence")} />
        <textarea className={inputCls} rows={2} placeholder="Failed attempts" value={f.failed_attempts} onChange={set("failed_attempts")} />
        <Err msg={err} />
        <Btn onClick={submit} disabled={busy}>{busy ? "Saving to Hindsight…" : "Submit outcome & retain"}</Btn>
      </div>
    </Card>
  );
}

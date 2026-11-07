import { ReactNode } from "react";

export const Card = ({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) => (
  <div className="rounded-xl border border-navy-700 bg-navy-900 p-4">
    {(title || right) && <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-200">{title}</h3>{right}</div>}
    {children}
  </div>
);

const badgeColors: Record<string, string> = {
  "MEMORY RETRIEVED": "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "MEMORY STORED": "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "MEMORY SYNC FAILED": "bg-red-500/15 text-red-300 border-red-500/40",
  "NO RELEVANT MEMORY": "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "MEMORY DISABLED": "bg-slate-500/15 text-slate-300 border-slate-500/40",
};
export const MemBadge = ({ s }: { s: string }) => (
  <span className={`rounded border px-2 py-0.5 text-[11px] font-bold tracking-wide ${badgeColors[s] || badgeColors["MEMORY DISABLED"]}`}>{s}</span>
);

const sevColors: Record<string, string> = { critical: "bg-red-500/20 text-red-300", high: "bg-orange-500/20 text-orange-300", medium: "bg-yellow-500/20 text-yellow-300", low: "bg-slate-500/20 text-slate-300" };
export const Sev = ({ s }: { s: string }) => <span className={`rounded px-2 py-0.5 text-xs font-semibold ${sevColors[s]}`}>{s}</span>;

export const Btn = ({ children, onClick, disabled, kind = "primary" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; kind?: "primary" | "ghost" | "danger" }) => (
  <button onClick={onClick} disabled={disabled}
    className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${kind === "primary" ? "bg-sky-600 hover:bg-sky-500 text-white" : kind === "danger" ? "bg-red-600 hover:bg-red-500 text-white" : "border border-navy-700 text-slate-300 hover:bg-navy-800"}`}>{children}</button>
);

export const Err = ({ msg }: { msg: string }) => msg ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{msg}</div> : null;
export const Empty = ({ text }: { text: string }) => <div className="py-6 text-center text-sm text-slate-500">{text}</div>;
export const inputCls = "w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none";

import { useState } from "react";
import { Activity, BarChart3, Brain, List, Siren } from "lucide-react";
import Investigate from "./Investigate";
import { Analytics, Incidents, MemoryCenter, Overview } from "./Pages";

const tabs = [["overview", "Overview", Activity], ["investigate", "Investigate", Siren], ["incidents", "Incidents", List], ["memory", "Memory Center", Brain], ["analytics", "Analytics", BarChart3]] as const;

export default function App() {
  const [tab, setTab] = useState<string>("overview");
  const [tick, setTick] = useState(0); const bump = () => setTick(t => t + 1);
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      <header className="border-b border-navy-700 bg-navy-900 px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <div><span className="text-lg font-bold text-white">IncidentIQ</span><span className="ml-3 hidden text-xs text-slate-400 md:inline">The first time, IncidentIQ investigates. The next time, IncidentIQ remembers.</span></div>
          <nav className="flex flex-wrap gap-1">{tabs.map(([k, l, Icon]) => <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${tab === k ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-navy-800"}`}><Icon size={14} />{l}</button>)}</nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        {tab === "overview" && <Overview tick={tick} />}
        {tab === "investigate" && <Investigate onChange={bump} />}
        {tab === "incidents" && <Incidents tick={tick} />}
        {tab === "memory" && <MemoryCenter onChange={bump} />}
        {tab === "analytics" && <Analytics tick={tick} />}
      </main>
    </div>
  );
}

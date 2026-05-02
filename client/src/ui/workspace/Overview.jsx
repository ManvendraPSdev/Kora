import Section from "../../components/Section";

export default function Overview({ workspace }) {
  return (
    <Section title="Overview" className="flex-1">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <p className="text-sm text-slate-400 font-medium">Total Tickets</p>
          <p className="mt-2 text-4xl font-bold text-slate-100">{workspace.overview?.total ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <p className="text-sm text-emerald-400 font-medium">Resolved</p>
          <p className="mt-2 text-4xl font-bold text-emerald-400">{workspace.overview?.resolved ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <p className="text-sm text-rose-400 font-medium">Escalated</p>
          <p className="mt-2 text-4xl font-bold text-rose-400">{workspace.overview?.escalated ?? "-"}</p>
        </div>
      </div>
    </Section>
  );
}

import Section from "../../components/Section";

export default function Tenants({ workspace }) {
  return (
    <Section title="Tenants / Workspaces" className="flex-1">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {workspace.tenants.map((tenant) => (
          <div key={tenant._id} className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
            <h3 className="font-semibold text-slate-100">{tenant.name}</h3>
            <p className="text-sm text-slate-400 mb-2">/{tenant.slug}</p>
            <span className="w-fit rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-400">
              {tenant.plan} Plan
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

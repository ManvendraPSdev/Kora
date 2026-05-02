import Section from "../../components/Section";
import Field from "../../components/InputField";
import Select from "../../components/SelectField";

export default function Users({
  workspace,
  forms,
  setForms,
  onCreateUser,
  userRoleOptions,
}) {
  return (
    <div className="flex-1 grid gap-6 lg:grid-cols-[350px_1fr] h-full overflow-hidden">
      <aside className="h-full sticky top-0">
        <Section title="Invite User" className="h-full flex flex-col">
          <form className="flex-1 flex flex-col justify-center gap-4" onSubmit={onCreateUser}>
            <Field label="Name" value={forms.user.name} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, name: v } }))} />
            <Field label="Email" value={forms.user.email} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, email: v } }))} />
            <Field label="Password" type="password" value={forms.user.password} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, password: v } }))} />
            <Select label="Role" value={forms.user.role} options={userRoleOptions} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, role: v } }))} />
            <button className="button-primary mt-4" type="submit">Create User</button>
          </form>
        </Section>
      </aside>
      <Section title="Team Members" className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
          <div className="grid gap-3">
            {workspace.users.map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-100 font-bold">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                  {u.role.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

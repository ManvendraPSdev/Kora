import Section from "../../components/Section";
import Field from "../../components/InputField";
import Textarea from "../../components/TextareaField";

export default function Kb({
  workspace,
  forms,
  setForms,
  onCreateKb,
  role,
}) {
  return (
    <div className="flex-1 grid gap-6 lg:grid-cols-[350px_1fr] h-full overflow-hidden">
      {(role === "admin" || role === "super_admin") && (
        <aside className="h-fit sticky top-0">
          <Section title="Create Article">
            <form className="grid gap-3" onSubmit={onCreateKb}>
              <Field label="Title" value={forms.kb.title} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, title: v } }))} />
              <Textarea label="Content" value={forms.kb.content} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, content: v } }))} />
              <Field label="Tags (comma separated)" value={forms.kb.tags} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, tags: v } }))} />
              <button className="button-primary mt-2" type="submit">Publish</button>
            </form>
          </Section>
        </aside>
      )}
      <Section title="Knowledge Base" className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {workspace.kbArticles.map((article) => (
              <div key={article._id} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
                <h3 className="font-semibold text-slate-100">{article.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-3">{article.content}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

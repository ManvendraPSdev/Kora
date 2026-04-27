import { API_BASE_URL } from "../services/apiClient";

const statusOptions = ["open", "in_progress", "escalated", "resolved", "closed"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const userRoleOptions = ["agent", "customer", "admin"];


function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input
        className="rounded border border-slate-300 px-3 py-2"
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <textarea
        rows={4}
        className="rounded border border-slate-300 px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <select
        className="rounded border border-slate-300 px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function AuthView({
  authMode,
  setAuthMode,
  loading,
  error,
  forms,
  onAuthSubmit,
  onForgotPassword,
  onResetPassword,
  setForms,
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-10">
      <Section title="Sign In / Register">
        <div className="mb-3 flex gap-2">
          <button className="button-primary" onClick={() => setAuthMode("login")} type="button">
            Login
          </button>
          <button className="button-primary" onClick={() => setAuthMode("register")} type="button">
            Register
          </button>
        </div>
        <form className="grid gap-2" onSubmit={onAuthSubmit}>
          {authMode === "register" && (
            <>
              <Field label="Business" value={forms.register.businessName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, businessName: v } }))} />
              <Field label="Slug" value={forms.register.slug} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, slug: v } }))} />
              <Field label="Admin Name" value={forms.register.adminName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, adminName: v } }))} />
            </>
          )}
          <Field
            label="Email"
            type="email"
            value={authMode === "login" ? forms.login.email : forms.register.email}
            onChange={(v) =>
              setForms((s) => ({
                ...s,
                [authMode]: { ...s[authMode], email: v },
              }))
            }
          />
          <Field
            label="Password"
            type="password"
            value={authMode === "login" ? forms.login.password : forms.register.password}
            onChange={(v) =>
              setForms((s) => ({
                ...s,
                [authMode]: { ...s[authMode], password: v },
              }))
            }
          />
          <button className="button-primary" disabled={loading} type="submit">
            {loading ? "Please wait..." : authMode === "login" ? "Login" : "Create Tenant"}
          </button>
        </form>
      </Section>

      <Section title="Password Recovery">
        <div className="grid gap-2">
          <Field
            label="Email"
            value={forms.reset.email}
            onChange={(v) => setForms((s) => ({ ...s, reset: { ...s.reset, email: v } }))}
          />
          <Field
            label="Token"
            value={forms.reset.token}
            onChange={(v) => setForms((s) => ({ ...s, reset: { ...s.reset, token: v } }))}
          />
          <Field
            label="New Password"
            type="password"
            value={forms.reset.newPassword}
            onChange={(v) => setForms((s) => ({ ...s, reset: { ...s.reset, newPassword: v } }))}
          />
          <div className="flex gap-2">
            <button className="button-primary" type="button" onClick={onForgotPassword}>
              Request reset
            </button>
            <button className="button-primary" type="button" onClick={onResetPassword}>
              Apply reset
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </Section>
    </div>
  );
}

function WorkspaceView({
  role,
  user,
  workspace,
  forms,
  setForms,
  onLogout,
  onCreateTicket,
  onSelectTicket,
  onSendTicketMessage,
  onUpdateStatus,
  onSuggestReplies,
  onStartChat,
  onSendChat,
  onCreateKb,
  onCreateUser,
}) {
  const nav = ["tickets", "chat", "kb"];
  if (role === "admin" || role === "super_admin") nav.unshift("overview");
  if (role === "admin" || role === "super_admin") nav.push("users");
  if (role === "super_admin") nav.push("tenants");

  const selectedTicket = workspace.tickets.find((t) => t._id === workspace.selectedTicketId);

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">{user?.name}</p>
        <p className="text-xs text-slate-500">{user?.role}</p>
        <div className="mt-4 grid gap-2">
          {nav.map((item) => (
            <button key={item} type="button" className="button-primary" onClick={() => workspace.setActiveSection(item)}>
              {item}
            </button>
          ))}
        </div>
        <button className="mt-4 w-full rounded border border-slate-300 px-3 py-2" onClick={onLogout} type="button">
          Logout
        </button>
      </aside>

      <main className="space-y-4">
        <Section title="Workspace">
          <p className="text-sm text-slate-600">API: {API_BASE_URL}</p>
          {workspace.error ? <p className="text-sm text-rose-700">{workspace.error}</p> : null}
          {workspace.success ? <p className="text-sm text-emerald-700">{workspace.success}</p> : null}
        </Section>

        {workspace.activeSection === "overview" && (
          <Section title="Overview">
            <div className="grid gap-2 md:grid-cols-3">
              <div>Total: {workspace.overview?.total ?? "-"}</div>
              <div>Resolved: {workspace.overview?.resolved ?? "-"}</div>
              <div>Escalated: {workspace.overview?.escalated ?? "-"}</div>
            </div>
          </Section>
        )}

        {workspace.activeSection === "tickets" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Create Ticket">
              <form className="grid gap-2" onSubmit={onCreateTicket}>
                <Field label="Title" value={forms.ticket.title} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, title: v } }))} />
                <Textarea label="Description" value={forms.ticket.description} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, description: v } }))} />
                <Select label="Priority" value={forms.ticket.priority} options={priorityOptions} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, priority: v } }))} />
                {role !== "customer" && (
                  <Field label="Customer ID" value={forms.ticket.customerId} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, customerId: v } }))} />
                )}
                <button className="button-primary" type="submit">Create</button>
              </form>
            </Section>

            <Section title="Ticket List">
              <div className="grid gap-2">
                {workspace.tickets.map((ticket) => (
                  <button key={ticket._id} type="button" className="rounded border border-slate-200 p-3 text-left" onClick={() => onSelectTicket(ticket._id)}>
                    {ticket.ticketNumber} - {ticket.title} ({ticket.status})
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Ticket Thread">
              {selectedTicket ? (
                <div className="space-y-2">
                  <Select label="Status" value={selectedTicket.status} options={statusOptions} onChange={(v) => onUpdateStatus(selectedTicket._id, v)} />
                  <button className="button-primary" type="button" onClick={onSuggestReplies}>
                    Suggest Replies
                  </button>
                  {workspace.suggestedReplies.map((reply) => (
                    <button key={reply} className="w-full rounded border border-slate-200 p-2 text-left" type="button" onClick={() => setForms((s) => ({ ...s, message: reply }))}>
                      {reply}
                    </button>
                  ))}
                  {workspace.ticketMessages.map((m) => (
                    <div key={m._id} className="rounded border border-slate-200 p-2 text-sm">
                      {m.senderRole}: {m.content}
                    </div>
                  ))}
                  <form className="grid gap-2" onSubmit={onSendTicketMessage}>
                    <Textarea label="Message" value={forms.message} onChange={(v) => setForms((s) => ({ ...s, message: v }))} />
                    <button className="button-primary" type="submit">Send</button>
                  </form>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Select a ticket.</p>
              )}
            </Section>
          </div>
        )}

        {workspace.activeSection === "chat" && (
          <Section title="AI Chat">
            <div className="space-y-2">
              <button className="button-primary" type="button" onClick={onStartChat}>Start Session</button>
              <p className="text-sm text-slate-500">Session: {workspace.chatSession?._id || "-"}</p>
              {workspace.chatMessages.map((m) => (
                <div key={m._id} className="rounded border border-slate-200 p-2 text-sm">
                  {m.senderRole}: {m.content}
                </div>
              ))}
              <form className="grid gap-2" onSubmit={onSendChat}>
                <Textarea label="Message" value={forms.chat} onChange={(v) => setForms((s) => ({ ...s, chat: v }))} />
                <button className="button-primary" type="submit">Send to AI</button>
              </form>
            </div>
          </Section>
        )}

        {workspace.activeSection === "kb" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {(role === "admin" || role === "super_admin") && (
              <Section title="Create KB">
                <form className="grid gap-2" onSubmit={onCreateKb}>
                  <Field label="Title" value={forms.kb.title} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, title: v } }))} />
                  <Textarea label="Content" value={forms.kb.content} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, content: v } }))} />
                  <Field label="Tags (comma separated)" value={forms.kb.tags} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, tags: v } }))} />
                  <button className="button-primary" type="submit">Create</button>
                </form>
              </Section>
            )}
            <Section title="KB Articles">
              {workspace.kbArticles.map((article) => (
                <div key={article._id} className="rounded border border-slate-200 p-2 text-sm">
                  <p className="font-medium">{article.title}</p>
                  <p>{article.content}</p>
                </div>
              ))}
            </Section>
          </div>
        )}

        {workspace.activeSection === "users" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Create User">
              <form className="grid gap-2" onSubmit={onCreateUser}>
                <Field label="Name" value={forms.user.name} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, name: v } }))} />
                <Field label="Email" value={forms.user.email} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, email: v } }))} />
                <Field label="Password" type="password" value={forms.user.password} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, password: v } }))} />
                <Select label="Role" value={forms.user.role} options={userRoleOptions} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, role: v } }))} />
                <button className="button-primary" type="submit">Create</button>
              </form>
            </Section>
            <Section title="Users">
              {workspace.users.map((u) => (
                <div key={u._id} className="rounded border border-slate-200 p-2 text-sm">
                  {u.name} ({u.role}) - {u.email}
                </div>
              ))}
            </Section>
          </div>
        )}

        {workspace.activeSection === "tenants" && (
          <Section title="Tenants">
            {workspace.tenants.map((tenant) => (
              <div key={tenant._id} className="rounded border border-slate-200 p-2 text-sm">
                {tenant.name} ({tenant.slug}) - {tenant.plan}
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

export { AuthView, WorkspaceView };

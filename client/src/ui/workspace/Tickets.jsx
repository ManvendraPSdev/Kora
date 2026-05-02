import Section from "../../components/Section";
import Field from "../../components/InputField";
import Textarea from "../../components/TextareaField";
import Select from "../../components/SelectField";

export default function Tickets({
  workspace,
  forms,
  setForms,
  onCreateTicket,
  onSelectTicket,
  onUpdateStatus,
  onSuggestReplies,
  onSendTicketMessage,
  role,
  priorityOptions,
  statusOptions,
}) {
  const selectedTicket = workspace.tickets.find((t) => t._id === workspace.selectedTicketId);

  return (
    <div className="flex-1 flex flex-col gap-6 w-full h-full">
      <Section title="Create Ticket" className="flex-1 flex flex-col">
        <form className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar" onSubmit={onCreateTicket}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Title" value={forms.ticket.title} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, title: v } }))} />
            <Select label="Priority" value={forms.ticket.priority} options={priorityOptions} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, priority: v } }))} />
            {role !== "customer" && (
              <Field label="Customer ID" value={forms.ticket.customerId} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, customerId: v } }))} />
            )}
          </div>
          <Textarea 
            label="Description" 
            value={forms.ticket.description} 
            onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, description: v } }))} 
            className="flex-1"
          />
          <div className="flex justify-center pt-2">
            <button className="button-primary px-20 py-3.5 text-lg" type="submit">Create New Ticket</button>
          </div>
        </form>
      </Section>

      <div className="flex-1 grid gap-6 lg:grid-cols-[1fr_350px] min-h-[500px]">
        <Section title="Ticket Thread" className="flex-1 flex flex-col">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <div className="w-48">
                  <Select label="Change Status" value={selectedTicket.status} options={statusOptions} onChange={(v) => onUpdateStatus(selectedTicket._id, v)} />
                </div>
                <button className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition" type="button" onClick={onSuggestReplies}>
                  Suggest AI Replies
                </button>
              </div>

              {workspace.suggestedReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {workspace.suggestedReplies.map((reply) => (
                    <button key={reply} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 transition hover:bg-indigo-500/20" type="button" onClick={() => setForms((s) => ({ ...s, message: reply }))}>
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 flex flex-col gap-4 mb-6 overflow-y-auto pr-2 no-scrollbar">
                {workspace.ticketMessages.map((m) => {
                  const isUser = m.senderRole === 'customer' || m.senderRole === role;
                  return (
                    <div key={m._id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        isUser
                          ? "bg-slate-200 text-slate-900 rounded-tr-sm"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm"
                      }`}>
                        <p className={`text-[10px] mb-1 font-semibold ${isUser ? "text-slate-500" : "text-slate-400"} capitalize`}>{m.senderRole.replace("_", " ")}</p>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="mt-auto pt-4 border-t border-slate-800 grid gap-3" onSubmit={onSendTicketMessage}>
                <Textarea label="Your Message" value={forms.message} onChange={(v) => setForms((s) => ({ ...s, message: v }))} />
                <button className="button-primary flex items-center justify-center gap-2" type="submit">
                  Send Message
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 border-2 border-dashed border-slate-800/50 rounded-xl">
              Select a ticket from the list to view its thread.
            </div>
          )}
        </Section>

        <Section title="Ticket List" className="flex-1 h-full">
          <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 no-scrollbar">
            {workspace.tickets.map((ticket) => {
              const isActive = selectedTicket?._id === ticket._id;
              return (
                <button
                  key={ticket._id}
                  type="button"
                  className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? "border-slate-600 bg-slate-800 shadow-lg"
                      : "border-slate-800/50 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800"
                  }`}
                  onClick={() => onSelectTicket(ticket._id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium text-slate-400">{ticket.ticketNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                      ticket.status === 'escalated' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{ticket.status}</span>
                  </div>
                  <span className="font-medium text-slate-200 truncate w-full">{ticket.title}</span>
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

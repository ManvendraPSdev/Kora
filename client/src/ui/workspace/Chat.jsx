import Section from "../../components/Section";
import Textarea from "../../components/TextareaField";

export default function Chat({
  workspace,
  forms,
  setForms,
  onStartChat,
  onSendChat,
  user,
}) {
  return (
    <Section title="AI Chat" className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
          <p className="text-sm text-slate-400">Session ID: <span className="text-slate-200">{workspace.chatSession?._id || "None"}</span></p>
          <button className="button-primary" type="button" onClick={onStartChat}>New Session</button>
        </div>

        <div className="flex flex-col gap-4 mb-6 overflow-y-auto pr-2 flex-1 no-scrollbar">
          {workspace.chatMessages.map((m) => {
            const isUser = m.senderRole === 'customer' || m.senderRole === user?.role;
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

        <form className="mt-auto border-t border-slate-800 pt-4 grid gap-3" onSubmit={onSendChat}>
          <Textarea label="Message AI" value={forms.chat} onChange={(v) => setForms((s) => ({ ...s, chat: v }))} />
          <button className="button-primary" type="submit">Send Message</button>
        </form>
      </div>
    </Section>
  );
}

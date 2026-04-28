import { useEffect, useRef, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useWorkspace } from "./hooks/useWorkspace";
import { AuthView, WorkspaceView } from "./ui/AppView";


function initialForms() {
  return {
    login: { email: "", password: "" },
    register: { businessName: "", slug: "", adminName: "", email: "", password: "" },
    ticket: { title: "", description: "", priority: "medium", customerId: "" },
    message: "",
    kb: { title: "", content: "", tags: "" },
    user: { name: "", email: "", password: "", role: "agent" },
    chat: "",
    reset: { email: "", token: "", newPassword: "" },
  };
}

export default function AppNew() {
  const [authMode, setAuthMode] = useState("login");
  const [forms, setForms] = useState(initialForms);
  const auth = useAuth();
  const workspace = useWorkspace();
  const bootstrapWorkspace = workspace.bootstrap;
  const bootstrappedTokenRef = useRef("");

  useEffect(() => {
    if (!auth.token) {
      bootstrappedTokenRef.current = "";
      return;
    }
    if (bootstrappedTokenRef.current === auth.token) return;

    bootstrappedTokenRef.current = auth.token;
    bootstrapWorkspace().catch(() => {});
  }, [auth.token, bootstrapWorkspace]);

  const role = auth.user?.role;

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    workspace.clearFlash();
    if (authMode === "login") await auth.login(forms.login);
    else await auth.register(forms.register);
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    await workspace.createTicket(forms.ticket);
    setForms((current) => ({
      ...current,
      ticket: { title: "", description: "", priority: "medium", customerId: "" },
    }));
  };

  const handleSendTicketMessage = async (event) => {
    event.preventDefault();
    if (!workspace.selectedTicketId || !forms.message.trim()) return;
    await workspace.addTicketMessage({
      ticketId: workspace.selectedTicketId,
      content: forms.message,
    });
    setForms((current) => ({ ...current, message: "" }));
  };

  const handleSendChat = async (event) => {
    event.preventDefault();
    if (!workspace.chatSession?._id || !forms.chat.trim()) return;
    await workspace.sendChatMessage({
      sessionId: workspace.chatSession._id,
      content: forms.chat,
    });
    setForms((current) => ({ ...current, chat: "" }));
  };

  if (!auth.token) {
    return (
      <AuthView
        authMode={authMode}
        setAuthMode={setAuthMode}
        loading={auth.loading || workspace.loading}
        error={auth.error || workspace.error}
        forms={forms}
        onAuthSubmit={handleAuthSubmit}
        onForgotPassword={() => workspace.forgotPassword(forms.reset.email)}
        onResetPassword={() => workspace.resetPassword(forms.reset)}
        setForms={setForms}
      />
    );
  }

  return (
    <WorkspaceView
      role={role}
      user={auth.user}
      workspace={workspace}
      forms={forms}
      setForms={setForms}
      onLogout={() => auth.logout()}
      onCreateTicket={handleCreateTicket}
      onSelectTicket={(ticketId) => workspace.selectTicket(ticketId)}
      onSendTicketMessage={handleSendTicketMessage}
      onUpdateStatus={(ticketId, status) => workspace.updateTicketStatus({ ticketId, status })}
      onSuggestReplies={() => workspace.suggestReplies(workspace.selectedTicketId)}
      onStartChat={() => workspace.startChatSession()}
      onSendChat={handleSendChat}
      onCreateKb={async (event) => {
        event.preventDefault();
        await workspace.createKbArticle({
          title: forms.kb.title,
          content: forms.kb.content,
          tags: forms.kb.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        });
        setForms((current) => ({ ...current, kb: { title: "", content: "", tags: "" } }));
      }}
      onCreateUser={async (event) => {
        event.preventDefault();
        await workspace.createUser(forms.user);
        setForms((current) => ({
          ...current,
          user: { name: "", email: "", password: "", role: "agent" },
        }));
      }}
    />
  );
}

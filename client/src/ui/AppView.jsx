import { useState } from "react";
import { API_BASE_URL } from "../services/apiClient";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import Section from "../components/Section";
import Overview from "./workspace/Overview";
import Tickets from "./workspace/Tickets";
import Chat from "./workspace/Chat";
import Kb from "./workspace/Kb";
import Users from "./workspace/Users";
import Tenants from "./workspace/Tenants";

const statusOptions = ["open", "in_progress", "escalated", "resolved", "closed"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const userRoleOptions = ["agent", "customer", "admin"];

function AuthView(props) {
  const [showReset, setShowReset] = useState(false);

  if (showReset) {
    return <ResetPassword {...props} setShowReset={setShowReset} />;
  }

  if (props.authMode === "login") {
    return <Login {...props} setShowReset={setShowReset} />;
  }

  return <Register {...props} />;
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
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      <aside className="h-full w-64 shrink-0 flex flex-col border-r border-slate-800 bg-slate-900 p-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-900 font-bold text-lg">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>

        <nav className="grid gap-1 overflow-y-auto no-scrollbar">
          {nav.map((item) => {
            const isActive = workspace.activeSection === item;
            return (
              <button
                key={item}
                type="button"
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                onClick={() => workspace.setActiveSection(item)}
              >
                <span className="capitalize">{item.replace("_", " ")}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <button
            className="flex w-full items-center justify-center rounded-lg border border-slate-800 bg-transparent px-3 py-2 text-sm font-medium text-slate-400 transition duration-200 hover:bg-slate-800/50 hover:text-slate-200"
            onClick={onLogout}
            type="button"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full flex flex-col p-6 w-full overflow-hidden">
        <div className="w-full pb-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Workspace</h1>
            <p className="text-sm text-slate-400">API: {API_BASE_URL}</p>
          </div>
          <div className="flex gap-2">
            {workspace.error ? <p className="text-sm font-medium text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">{workspace.error}</p> : null}
            {workspace.success ? <p className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">{workspace.success}</p> : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar mt-6">

          {workspace.activeSection === "overview" && <Overview workspace={workspace} />}

          {workspace.activeSection === "tickets" && (
            <Tickets
              workspace={workspace}
              forms={forms}
              setForms={setForms}
              onCreateTicket={onCreateTicket}
              onSelectTicket={onSelectTicket}
              onUpdateStatus={onUpdateStatus}
              onSuggestReplies={onSuggestReplies}
              onSendTicketMessage={onSendTicketMessage}
              role={role}
              priorityOptions={priorityOptions}
              statusOptions={statusOptions}
            />
          )}

          {workspace.activeSection === "chat" && (
            <Chat
              workspace={workspace}
              forms={forms}
              setForms={setForms}
              onStartChat={onStartChat}
              onSendChat={onSendChat}
              user={user}
            />
          )}

          {workspace.activeSection === "kb" && (
            <Kb
              workspace={workspace}
              forms={forms}
              setForms={setForms}
              onCreateKb={onCreateKb}
              role={role}
            />
          )}

          {workspace.activeSection === "users" && (
            <Users
              workspace={workspace}
              forms={forms}
              setForms={setForms}
              onCreateUser={onCreateUser}
              userRoleOptions={userRoleOptions}
            />
          )}

          {workspace.activeSection === "tenants" && <Tenants workspace={workspace} />}
        </div>
      </main>
    </div>
  );
}

export { AuthView, WorkspaceView };

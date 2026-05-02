import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axiosInstance from "../../api/axiosInstance";

function getSocketBaseUrl() {
  const base =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://127.0.0.1:3000/api/v1" : "/api/v1");
  return base.replace(/\/api\/v1\/?$/, "") || "";
}

function formatTimeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function truncate(str, n) {
  if (!str) return "";
  return str.length <= n ? str : `${str.slice(0, n)}…`;
}

function priorityBadgeClass(priority) {
  switch (priority) {
    case "urgent":
      return "bg-red-600 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-yellow-400 text-slate-900";
    case "low":
      return "bg-gray-300 text-gray-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800";
    case "in_progress":
      return "bg-amber-100 text-amber-900";
    case "escalated":
      return "bg-purple-100 text-purple-900";
    case "resolved":
      return "bg-green-100 text-green-900";
    case "closed":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);

  const [tickets, setTickets] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [toastText, setToastText] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axiosInstance.get("/tickets", {
        params: { assignedAgentId: "me", page: 1, limit: 20 },
      });
      const list = res.data?.data?.tickets ?? [];
      setTickets(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    if (user?.role && user.role !== "agent") {
      navigate("/");
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (!user?.id || !token) return undefined;

    fetchTickets();

    const base = getSocketBaseUrl();
    const socket = io(base, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit("agent:join", { agentId: String(user.id) });
    };

    const onNotify = (payload) => {
      setNotifications((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random()}`,
            ...payload,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 50)
      );
      setToastText(payload.message || "New notification");
      window.setTimeout(() => setToastText(null), 4000);
      fetchTickets();
    };

    socket.on("connect", onConnect);
    socket.on("agent:notification", onNotify);

    return () => {
      socket.off("connect", onConnect);
      socket.off("agent:notification", onNotify);
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [user?.id, token, fetchTickets]);

  useEffect(() => {
    if (!selectedTicket?._id || !socketConnected) return undefined;

    const socket = socketRef.current;
    const tid = String(selectedTicket._id);

    const loadMessages = async () => {
      try {
        const res = await axiosInstance.get(`/tickets/${tid}/messages`);
        const list = res.data?.data?.messages ?? [];
        setMessages(list);
      } catch (e) {
        console.error(e);
      }
    };

    loadMessages();

    if (socket) {
      socket.emit("ticket:join", { ticketId: tid });
    }

    const onNewMsg = (payload) => {
      const msg = payload?.message;
      if (!msg) return;
      const mtid = msg.ticketId ? String(msg.ticketId) : "";
      if (mtid && mtid !== tid) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };

    if (socket) socket.on("ticket:message:new", onNewMsg);

    return () => {
      if (socket) {
        socket.off("ticket:message:new", onNewMsg);
        socket.emit("ticket:leave", { ticketId: tid });
      }
    };
  }, [selectedTicket?._id, socketConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleSendReply(event) {
    event.preventDefault();
    if (!selectedTicket || !replyText.trim() || sending) return;
    setSending(true);
    try {
      await axiosInstance.post(`/tickets/${selectedTicket._id}/messages`, {
        content: replyText.trim(),
      });
      setReplyText("");
      const res = await axiosInstance.get(`/tickets/${selectedTicket._id}/messages`);
      setMessages(res.data?.data?.messages ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  function handleBellClick() {
    setShowBellDropdown((v) => !v);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const senderLabel = (msg) => {
    if (msg.senderRole === "ai") return "AI";
    return msg.senderId?.name || msg.senderRole || "User";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {toastText ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toastText}
        </div>
      ) : null}

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">👩‍💼</span>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Agent Dashboard</h1>
            <p className="text-xs text-slate-500">
              {user?.name}{" "}
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Filter</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="all">All ({tickets.length})</option>
              <option value="open">
                Open ({statusCounts.open})
              </option>
              <option value="in_progress">
                In progress ({statusCounts.in_progress})
              </option>
              <option value="resolved">
                Resolved ({statusCounts.resolved})
              </option>
            </select>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={handleBellClick}
              className="relative rounded-full border border-slate-300 p-2 hover:bg-slate-100"
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>
            {showBellDropdown ? (
              <div className="absolute right-0 z-40 mt-2 max-h-72 w-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                <p className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  Notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-500">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="border-b border-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-800">{n.message || n.type}</p>
                      <p className="text-xs text-slate-400">{n.createdAt ? formatTimeAgo(n.createdAt) : ""}</p>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-h-[calc(100vh-72px)] max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-slate-200 bg-white lg:max-h-[calc(100vh-72px)] lg:overflow-y-auto">
          <div className="sticky top-0 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assigned tickets
          </div>
          {loadingList ? (
            <p className="p-4 text-sm text-slate-500">Loading…</p>
          ) : filteredTickets.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No tickets match this filter.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredTickets.map((t) => {
                const selected = selectedTicket && String(selectedTicket._id) === String(t._id);
                const customerName =
                  t.customerId && typeof t.customerId === "object" ? t.customerId.name : "Customer";
                return (
                  <li key={t._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full px-3 py-3 text-left transition ${
                        selected ? "border-l-4 border-l-slate-900 bg-slate-50" : "border-l-4 border-l-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">{t.ticketNumber}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${priorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-700">{truncate(t.title, 40)}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${statusBadgeClass(t.status)}`}>
                          {t.status?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{customerName}</p>
                      <p className="text-[10px] text-slate-400">{formatTimeAgo(t.createdAt)}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <main className="flex max-h-[calc(100vh-72px)] flex-col bg-white lg:border-l lg:border-slate-100">
          {!selectedTicket ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-slate-500">
              <div className="text-6xl opacity-40">📋</div>
              <p className="max-w-sm text-lg font-medium text-slate-700">Select a ticket to start helping</p>
              <p className="max-w-md text-sm">Choose a ticket from the list on the left to view the thread and reply.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="font-semibold text-slate-900">{selectedTicket.ticketNumber}</h2>
                <p className="text-sm text-slate-600">{selectedTicket.title}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((msg) => {
                  const isCustomer = msg.senderRole === "customer";
                  const isAi = msg.senderRole === "ai";
                  const isAgentSide = msg.senderRole === "agent" || msg.senderRole === "admin";
                  let bubble =
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm ";
                  let align = "";
                  if (isCustomer) {
                    bubble += "mr-auto bg-gray-100 text-slate-900";
                    align = "flex justify-start";
                  } else if (isAi) {
                    bubble += "mr-auto bg-purple-100 text-slate-900";
                    align = "flex justify-start";
                  } else if (isAgentSide) {
                    bubble += "ml-auto bg-gray-900 text-white";
                    align = "flex justify-end";
                  } else {
                    bubble += "mr-auto bg-gray-100 text-slate-900";
                    align = "flex justify-start";
                  }
                  const time = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";
                  return (
                    <div key={msg._id} className={`flex w-full ${align}`}>
                      <div className={bubble}>
                        <div className="mb-1 flex items-center gap-2 text-[10px] opacity-80">
                          <span className="font-semibold">{senderLabel(msg)}</span>
                          {isAi ? (
                            <span className="rounded bg-purple-200 px-1 text-[9px] font-bold text-purple-900">AI</span>
                          ) : null}
                          <span>{time}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendReply} className="border-t border-slate-100 p-4">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending…
                      </>
                    ) : (
                      <>Send Reply →</>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

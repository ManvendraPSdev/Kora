import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toastAgent, setToastAgent] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const ticketClosed =
    ticket && (ticket.status === "closed" || ticket.status === "resolved");

  useEffect(() => {
    if (!token) navigate("/");
    else if (user?.role && user.role !== "customer") navigate("/");
  }, [token, user, navigate]);

  useEffect(() => {
    if (!id || !token) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          axiosInstance.get(`/tickets/${id}`),
          axiosInstance.get(`/tickets/${id}/messages`),
        ]);
        if (cancelled) return;
        setTicket(tRes.data?.data?.ticket ?? null);
        setMessages(mRes.data?.data?.messages ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return undefined;

    const base = getSocketBaseUrl();
    const socket = io(base, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    const onConnect = () => {
      socket.emit("ticket:join", { ticketId: id });
    };

    socket.on("connect", onConnect);
    if (socket.connected) {
      socket.emit("ticket:join", { ticketId: id });
    }

    const onNewMsg = (payload) => {
      const msg = payload?.message;
      if (!msg || String(msg.ticketId) !== String(id)) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };

    const onAgentReplied = () => {
      setToastAgent("Agent has replied to your ticket");
      window.setTimeout(() => setToastAgent(null), 4000);
    };

    socket.on("ticket:message:new", onNewMsg);
    socket.on("ticket:agent:replied", onAgentReplied);

    return () => {
      socket.off("connect", onConnect);
      socket.off("ticket:message:new", onNewMsg);
      socket.off("ticket:agent:replied", onAgentReplied);
      socket.emit("ticket:leave", { ticketId: id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    if (!body.trim() || sending || ticketClosed || !id) return;
    setSending(true);
    try {
      await axiosInstance.post(`/tickets/${id}/messages`, { content: body.trim() });
      setBody("");
      const res = await axiosInstance.get(`/tickets/${id}/messages`);
      setMessages(res.data?.data?.messages ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  function priorityUI(p) {
    const map = {
      urgent: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "⚪",
    };
    return map[p] || p;
  }

  function statusUI(s) {
    const labels = {
      open: "Open 🔴",
      in_progress: "In Progress 🟡",
      escalated: "Escalated 🟣",
      resolved: "Resolved 🟢",
      closed: "Closed ⚫",
    };
    return labels[s] || s;
  }

  const assignedName =
    ticket?.assignedAgentId && typeof ticket.assignedAgentId === "object"
      ? ticket.assignedAgentId.name
      : "—";

  const senderDisplay = (msg) => {
    if (msg.senderRole === "ai") return "AI";
    return msg.senderId?.name || msg.senderRole;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-rose-700">Ticket not found.</p>
        <Link to="/my-tickets" className="mt-4 inline-block text-blue-600 underline">
          Back to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {toastAgent ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white shadow-lg">
          {toastAgent}
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 pt-6">
        <Link to="/my-tickets" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
          ← Back to My Tickets
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-mono text-sm font-semibold text-slate-800">{ticket.ticketNumber}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">“{ticket.title}”</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
            <span>
              Status: <strong>{statusUI(ticket.status)}</strong>
            </span>
            <span>
              Priority: <strong>{priorityUI(ticket.priority)}</strong>
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            Assigned to: <strong>{assignedName}</strong>
          </p>
        </div>

        <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          {messages.map((msg) => {
            const isCustomer = msg.senderRole === "customer";
            const isAi = msg.senderRole === "ai";
            const isAgent = msg.senderRole === "agent" || msg.senderRole === "admin";

            let row = "flex w-full ";
            let bubble = "max-w-[85%] rounded-lg px-3 py-2 text-sm ";

            if (isCustomer) {
              row += "justify-end";
              bubble += "bg-blue-600 text-white";
            } else if (isAi) {
              row += "justify-start";
              bubble += "bg-purple-50 text-slate-900 ring-1 ring-purple-200";
            } else if (isAgent) {
              row += "justify-start";
              bubble += "bg-gray-100 text-gray-900";
            } else {
              row += "justify-start";
              bubble += "bg-gray-100 text-gray-900";
            }

            return (
              <div key={msg._id} className={row}>
                <div className={bubble}>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] opacity-90">
                    {isAi ? (
                      <span className="font-semibold">🤖 AI</span>
                    ) : (
                      <span className="font-semibold">
                        [{isCustomer ? "YOU" : isAgent ? "AGENT" : msg.senderRole?.toUpperCase()}]{" "}
                        {senderDisplay(msg)}
                      </span>
                    )}
                    {isAi && msg.aiConfidence != null ? (
                      <span className="rounded bg-purple-200 px-1 text-[9px]">
                        {Math.round(Number(msg.aiConfidence) * 100)}% confident
                      </span>
                    ) : null}
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {ticketClosed ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This ticket is closed. Open a new ticket if you need further help.
          </p>
        ) : (
          <form onSubmit={handleSend} className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 shadow-lg">
            <div className="mx-auto max-w-3xl">
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe your issue further or reply to the agent..."
                className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send Message →"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

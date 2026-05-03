import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axiosInstance from "../../api/axiosInstance";
import Toast from "../../components/common/Toast";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import ChatBubble from "../../components/ui/ChatBubble";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

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

  const ticketClosed = ticket && (ticket.status === "closed" || ticket.status === "resolved");

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
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return undefined;
    const base = getSocketBaseUrl();
    const socket = io(base, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    const onConnect = () => { socket.emit("ticket:join", { ticketId: id }); };
    socket.on("connect", onConnect);
    if (socket.connected) socket.emit("ticket:join", { ticketId: id });
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
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  }

  const assignedName =
    ticket?.assignedAgentId && typeof ticket.assignedAgentId === "object"
      ? ticket.assignedAgentId.name
      : "—";

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-gradient)" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  /* ── Not found ── */
  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-gradient)" }}>
        <div className="card p-8 max-w-sm w-full text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-lg mb-1" style={{ color: "var(--text)" }}>Ticket not found</p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>This ticket may have been removed or you don't have access.</p>
          <Link to="/my-tickets">
            <Button variant="primary" size="md">← Back to My Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-gradient)" }}>
      <Toast message={toastAgent} variant="success" visible={!!toastAgent} />

      {/* Page header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm text-white shrink-0"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }}
        >
          K
        </div>
        <span className="font-bold text-base" style={{ color: "var(--text)" }}>Kora</span>
        <span className="mx-1" style={{ color: "var(--border)" }}>/</span>
        <Link
          to="/my-tickets"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--brand)" }}
        >
          My Tickets
        </Link>
        <span className="mx-1" style={{ color: "var(--border)" }}>/</span>
        <span className="font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>
          {ticket.ticketNumber}
        </span>
      </header>

      <div className="mx-auto max-w-2xl w-full px-4 py-6 flex flex-col gap-4 pb-32">
        {/* Ticket info card */}
        <div className="card p-5 animate-fade-in">
          <p className="font-mono text-xs font-bold mb-1" style={{ color: "var(--text-muted)" }}>
            {ticket.ticketNumber}
          </p>
          <h1 className="text-xl font-bold leading-snug mb-3" style={{ color: "var(--text)" }}>
            {ticket.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge value={ticket.status} type="status" />
            <Badge value={ticket.priority} type="priority" />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Assigned to: <strong style={{ color: "var(--text)" }}>{assignedName}</strong>
            </span>
          </div>
        </div>

        {/* Message thread */}
        <div className="card p-4 flex flex-col gap-4 animate-fade-in">
          {messages.length === 0 ? (
            <EmptyState icon="💬" title="No messages yet" description="Send a message below to start the conversation." />
          ) : (
            messages.map((msg) => (
              <ChatBubble key={msg._id} message={msg} currentRole="customer" />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {ticketClosed && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ background: "var(--status-progress-bg)", color: "var(--status-progress-text)", border: "1px solid var(--status-progress-border)" }}
          >
            This ticket is closed. Please open a new ticket if you need further help.
          </div>
        )}
      </div>

      {/* Fixed reply bar */}
      {!ticketClosed && (
        <div
          className="fixed bottom-0 left-0 right-0 border-t p-4 shadow-lg"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <form onSubmit={handleSend} className="mx-auto max-w-2xl flex flex-col gap-2">
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your issue further or reply to the agent..."
              className="field-input resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={sending}
                disabled={sending || !body.trim()}
              >
                Send Message →
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

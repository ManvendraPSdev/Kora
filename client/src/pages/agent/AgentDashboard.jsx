import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/layout/Navbar";
import Toast from "../../components/common/Toast";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import TicketCard from "../../components/ui/TicketCard";
import ChatBubble from "../../components/ui/ChatBubble";
import Button from "../../components/common/Button";

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
  const [messagesLoading, setMessagesLoading] = useState(false);

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
    if (!token) { navigate("/"); return; }
    if (user?.role && user.role !== "agent") navigate("/");
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
        [{ id: `${Date.now()}-${Math.random()}`, ...payload, read: false, createdAt: new Date().toISOString() }, ...prev].slice(0, 50)
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
    if (!selectedTicket?._id) return undefined;
    const tid = String(selectedTicket._id);
    
    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await axiosInstance.get(`/tickets/${tid}/messages`);
        setMessages(res.data?.data?.messages ?? []);
      } catch (e) { 
        console.error(e); 
      } finally {
        setMessagesLoading(false);
      }
    };
    
    loadMessages();
    
    const socket = socketRef.current;
    if (socket && socketConnected) {
      socket.emit("ticket:join", { ticketId: tid });
      
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
      
      socket.on("ticket:message:new", onNewMsg);
      
      return () => {
        socket.off("ticket:message:new", onNewMsg);
        socket.emit("ticket:leave", { ticketId: tid });
      };
    }
  }, [selectedTicket?._id, socketConnected]);

  // Polling for agent messages
  useEffect(() => {
    if (!selectedTicket?._id) return undefined;
    const tid = String(selectedTicket._id);
    
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/tickets/${tid}/messages`);
        const newMsgs = res.data?.data?.messages ?? [];
        setMessages((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newMsgs)) {
            return newMsgs;
          }
          return prev;
        });
      } catch (e) {
        console.error("Agent polling error:", e);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [selectedTicket?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };
  const filteredTickets = tickets.filter((t) => statusFilter === "all" || t.status === statusFilter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleSendReply(event) {
    event.preventDefault();
    const messageContent = replyText.trim();
    if (!selectedTicket || !messageContent || sending) return;
    
    setSending(true);
    setReplyText(""); // Clear input immediately
    
    try {
      const res = await axiosInstance.post(`/tickets/${selectedTicket._id}/messages`, { content: messageContent });
      const newMessage = res.data?.data?.message;
      
      if (newMessage) {
        setMessages(prev => {
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      } else {
        // Fallback fetch
        const mRes = await axiosInstance.get(`/tickets/${selectedTicket._id}/messages`);
        setMessages(mRes.data?.data?.messages ?? []);
      }
    } catch (err) { 
      console.error(err);
      setReplyText(messageContent); // Restore if failed
    } finally { 
      setSending(false); 
    }
  }

  function handleBellClick() {
    setShowBellDropdown((v) => !v);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-gradient)" }}>
      <Toast message={toastText} variant="info" visible={!!toastText} />

      <Navbar
        user={user}
        socketConnected={socketConnected}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        ticketCount={tickets.length}
        unreadCount={unreadCount}
        onBellClick={handleBellClick}
        showBellDropdown={showBellDropdown}
        notifications={notifications}
        formatTimeAgo={formatTimeAgo}
      />

      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 56px)" }}
      >
        {/* Ticket sidebar */}
        <aside
          className="flex flex-col w-72 shrink-0 border-r overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="px-4 py-2.5 border-b section-title"
            style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
          >
            Assigned Tickets
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loadingList ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="md" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <EmptyState icon="🎫" title="No tickets" description="No tickets match this filter." />
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredTickets.map((t) => (
                  <li key={t._id}>
                    <TicketCard
                      ticket={t}
                      selected={selectedTicket && String(selectedTicket._id) === String(t._id)}
                      onClick={() => setSelectedTicket(t)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main thread */}
        <main className="flex flex-1 flex-col overflow-hidden" style={{ background: "var(--surface)" }}>
          {!selectedTicket ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon="💬"
                title="Select a ticket to begin"
                description="Choose a ticket from the list to view the conversation thread and reply."
              />
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div
                className="px-5 py-3.5 border-b flex items-start justify-between gap-3"
                style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
              >
                <div>
                  <p className="font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                    {selectedTicket.ticketNumber}
                  </p>
                  <h2 className="font-semibold text-sm mt-0.5" style={{ color: "var(--text)" }}>
                    {truncate(selectedTicket.title, 80)}
                  </h2>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-4 relative min-h-[200px]">
                {messagesLoading && messages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="h-16 w-3/4 bg-gray-200 animate-pulse rounded-lg opacity-20" />
                    <div className="h-16 w-3/4 bg-gray-200 animate-pulse rounded-lg ml-auto opacity-20" />
                    <div className="h-16 w-3/4 bg-gray-200 animate-pulse rounded-lg opacity-20" />
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState icon="💬" title="No messages yet" description="Send the first reply below." />
                ) : (
                  messages.map((msg) => (
                    <ChatBubble key={msg._id} message={msg} currentRole="agent" />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply form */}
              <form
                onSubmit={handleSendReply}
                className="border-t p-4"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="field-input mb-3 resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={sending}
                    disabled={sending || !replyText.trim()}
                  >
                    Send Reply →
                  </Button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

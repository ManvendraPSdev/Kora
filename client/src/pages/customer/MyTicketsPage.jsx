import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) navigate("/");
    else if (user?.role && user.role !== "customer") navigate("/");
  }, [token, user, navigate]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get("/tickets");
        if (!cancelled) setTickets(res.data?.data?.tickets ?? []);
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-gradient)" }}>
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
        <span className="ml-auto text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {user?.name}
        </span>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Tickets</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            View your support tickets and track their status.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🎫"
              title="No tickets yet"
              description="When you submit a support request, your tickets will appear here."
            />
          </div>
        ) : (
          <ul className="space-y-3 animate-fade-in">
            {tickets.map((t) => (
              <li key={t._id}>
                <Link
                  to={`/tickets/${t._id}`}
                  className="card card-hover flex items-center gap-4 p-4 block no-underline"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                        {t.ticketNumber}
                      </span>
                      <Badge value={t.priority} type="priority" />
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{t.title}</p>
                  </div>
                  <Badge value={t.status} type="status" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

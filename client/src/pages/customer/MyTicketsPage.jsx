import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";

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
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">My tickets</h1>
      <p className="mt-1 text-sm text-slate-600">Select a ticket to view the conversation.</p>
      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="mt-6 text-slate-500">You have no tickets yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {tickets.map((t) => (
            <li key={t._id}>
              <Link
                to={`/tickets/${t._id}`}
                className="block px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-mono text-sm font-semibold text-slate-800">{t.ticketNumber}</span>
                <span className="ml-2 text-sm text-slate-600">{t.title}</span>
                <span className="mt-1 block text-xs uppercase text-slate-400">{t.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Badge from "../common/Badge";
import { motion } from "framer-motion";

function formatTimeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function TicketCard({ ticket, selected = false, onClick }) {
  const customerName =
    ticket.customerId && typeof ticket.customerId === "object"
      ? ticket.customerId.name
      : "Customer";

  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 transition-all border-l-2 rounded-r-xl my-1 ${
        selected
          ? "border-l-brand bg-brand/5 shadow-inner"
          : "border-l-transparent hover:bg-surface-raised"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] font-bold text-text-muted tracking-tight">
          #{ticket.ticketNumber}
        </span>
        <Badge value={ticket.priority} type="priority" />
      </div>
      
      <p className={`text-sm font-bold leading-tight line-clamp-2 transition-colors ${selected ? "text-brand" : "text-text"}`}>
        {ticket.title}
      </p>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge value={ticket.status} type="status" />
          <span className="text-[11px] font-medium text-text-muted">by {customerName}</span>
        </div>
        <span className="text-[10px] font-medium text-text-muted/60">{formatTimeAgo(ticket.createdAt)}</span>
      </div>
    </motion.button>
  );
}

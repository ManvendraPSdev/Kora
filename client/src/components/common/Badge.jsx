const STATUS_STYLES = {
  open:        "bg-status-open-bg text-status-open-text border-status-open-border",
  in_progress: "bg-status-progress-bg text-status-progress-text border-status-progress-border",
  escalated:   "bg-status-escalated-bg text-status-escalated-text border-status-escalated-border",
  resolved:    "bg-status-resolved-bg text-status-resolved-text border-status-resolved-border",
  closed:      "bg-status-closed-bg text-status-closed-text border-status-closed-border",
};

const PRIORITY_STYLES = {
  urgent: "bg-priority-urgent-bg text-priority-urgent-text border-transparent",
  high:   "bg-priority-high-bg text-priority-high-text border-transparent",
  medium: "bg-priority-medium-bg text-priority-medium-text border-transparent",
  low:    "bg-priority-low-bg text-priority-low-text border-transparent",
};

export default function Badge({ value, type = "status", className = "" }) {
  const val = value?.toLowerCase?.() ?? "";
  const styleMap = type === "priority" ? PRIORITY_STYLES : STATUS_STYLES;
  const styles = styleMap[val] ?? "bg-surface-raised text-text-secondary border-border";
  
  const label = val.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${styles} ${className}`}>
      {type === "status" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      {label}
    </span>
  );
}

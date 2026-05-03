/**
 * Navbar — top header bar for Agent Dashboard.
 * Accepts user info, filter controls, and notification data as props.
 */
export default function Navbar({
  user,
  socketConnected,
  statusFilter,
  onFilterChange,
  statusCounts,
  ticketCount,
  unreadCount,
  onBellClick,
  showBellDropdown,
  notifications,
  formatTimeAgo,
}) {
  return (
    <header
      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b sticky top-0 z-10"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Left: Brand + user */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm text-white shrink-0"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }}
        >
          K
        </div>
        <div>
          <h1 className="text-base font-bold leading-none" style={{ color: "var(--text)" }}>
            Agent Dashboard
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.name}</p>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase"
              style={{ background: "var(--brand-light)", color: "var(--brand-dark)" }}
            >
              {user?.role}
            </span>
            {/* socket status dot */}
            <span
              className={`block h-1.5 w-1.5 rounded-full ${socketConnected ? "bg-emerald-500" : "bg-slate-300"}`}
              title={socketConnected ? "Live" : "Connecting…"}
            />
          </div>
        </div>
      </div>

      {/* Right: filter + bell */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter */}
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="field-input !py-1 !px-2 !text-xs w-auto"
          >
            <option value="all">All ({ticketCount})</option>
            <option value="open">Open ({statusCounts.open})</option>
            <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
            <option value="resolved">Resolved ({statusCounts.resolved})</option>
          </select>
        </label>

        {/* Notifications bell */}
        <div className="relative">
          <button
            type="button"
            onClick={onBellClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[--brand-light]"
            style={{ borderColor: "var(--border)" }}
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)" }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showBellDropdown && (
            <div
              className="absolute right-0 z-50 mt-2 w-80 rounded-xl border shadow-lg overflow-hidden animate-fade-in"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p
                className="px-4 py-2.5 text-xs font-semibold section-title border-b"
                style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
              >
                Notifications
              </p>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b last:border-b-0 text-sm"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p className="font-medium" style={{ color: "var(--text)" }}>{n.message || n.type}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {n.createdAt ? formatTimeAgo(n.createdAt) : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

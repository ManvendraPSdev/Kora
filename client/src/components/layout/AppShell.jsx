import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ICONS = {
  overview: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  tickets: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-4-4z" /><path d="M15 5v4h4" /><path d="M9 12h6M9 16h4" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  kb: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tenants: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

const NAV_LABELS = {
  overview: "Overview",
  tickets:  "Tickets",
  chat:     "AI Chat",
  kb:       "Knowledge Base",
  users:    "Users",
  tenants:  "Tenants",
};

export default function AppShell({
  user,
  navItems,
  activeSection,
  onNavClick,
  onLogout,
  children,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-brand/30">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-50 glass h-16 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-surface-raised rounded-lg text-text-secondary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center font-black text-white text-lg shadow-lg shadow-brand/20">K</div>
            <span className="text-xl font-black tracking-tight text-white">Kora</span>
            <div className="hidden sm:block px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-bold text-brand uppercase tracking-widest">v2.0</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <p className="text-sm font-bold text-text">{user?.name ?? "—"}</p>
            <p className="text-[10px] font-bold text-brand uppercase tracking-wider">{user?.role ?? ""}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-surface-raised to-surface-active border border-white/10 flex items-center justify-center text-sm font-black text-brand shadow-lg">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)] relative">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface/50 border-r border-white/5 p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <p className="px-4 py-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Workspace</p>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onNavClick(item)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${
                  activeSection === item 
                    ? "bg-brand text-white shadow-lg shadow-brand/20" 
                    : "text-text-secondary hover:text-text hover:bg-surface-raised"
                }`}
              >
                <span className={`${activeSection === item ? "text-white" : "text-text-muted group-hover:text-brand"} transition-colors`}>
                  {NAV_ICONS[item]}
                </span>
                {NAV_LABELS[item] ?? item}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-status-open-text hover:bg-status-open-bg transition-all duration-300 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                className="fixed inset-y-0 left-0 z-[70] w-72 bg-surface p-6 shadow-2xl lg:hidden flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center font-black text-white shadow-lg">K</div>
                    <span className="text-lg font-black tracking-tight text-white">Kora</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-surface-raised rounded-lg text-text-secondary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => { onNavClick(item); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeSection === item 
                          ? "bg-brand text-white shadow-lg shadow-brand/20" 
                          : "text-text-secondary hover:text-text hover:bg-surface-raised"
                      }`}
                    >
                      {NAV_ICONS[item]}
                      {NAV_LABELS[item] ?? item}
                    </button>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <button onClick={onLogout} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-status-open-text hover:bg-status-open-bg transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar relative p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

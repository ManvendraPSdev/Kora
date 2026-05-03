import { motion, AnimatePresence } from "framer-motion";
import AppShell from "../components/layout/AppShell";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import MetricCard from "../components/ui/MetricCard";
import FormField from "../components/ui/FormField";
import FormSelect from "../components/ui/FormSelect";
import FormTextarea from "../components/ui/FormTextarea";
import EmptyState from "../components/common/EmptyState";
import ChatBubble from "../components/ui/ChatBubble";
import TicketCard from "../components/ui/TicketCard";

const statusOptions = ["open", "in_progress", "escalated", "resolved", "closed"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const userRoleOptions = ["agent", "customer", "admin"];

function AuthView({ authMode, setAuthMode, loading, error, forms, onAuthSubmit, setForms }) {
  const role = forms.authRole || "admin";
  const submitLabel = authMode === "login" ? "Sign In" : role === "admin" ? "Create Tenant" : "Register";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg overflow-hidden relative p-4 lg:p-0">
      {/* ── Background Orbs ── */}
      <div className="auth-orb orb-1 top-[-100px] left-[-100px]"></div>
      <div className="auth-orb orb-2 bottom-[-100px] right-[-100px]"></div>
      
      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-8 lg:gap-0 glass-panel rounded-[40px] overflow-hidden z-10">
        {/* ── Left Side: Branding ── */}
        <div className="hidden lg:flex flex-col justify-between p-16 brand-gradient relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-white text-2xl shadow-xl">K</div>
            <span className="text-white font-black text-2xl tracking-tighter">Kora</span>
          </div>

          <div className="relative z-10 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-black text-6xl leading-[1.1] tracking-tighter"
            >
              Support<br />Simplified<br />By AI.
            </motion.h1>
            <p className="text-white/70 text-lg max-w-md font-medium leading-relaxed">
              The next generation of customer support is here. Resolve issues faster with our AI-powered workspace.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" className="rounded-full" />
                </div>
              ))}
            </div>
            <p className="text-white/60 text-sm font-bold tracking-wide uppercase">Trusted by 500+ teams</p>
          </div>
        </div>

        {/* ── Right Side: Forms ── */}
        <div className="flex flex-col p-8 lg:p-16 bg-surface/50 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
              <p className="text-text-muted text-sm font-medium">Please enter your details to continue</p>
            </div>
            <div className="lg:hidden h-10 w-10 rounded-xl brand-gradient flex items-center justify-center font-black text-white shadow-lg">K</div>
          </div>

          <div className="flex p-1.5 bg-bg-darker rounded-2xl mb-8 border border-white/5">
            {["login", "register"].map((mode) => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-300 capitalize ${
                  authMode === mode ? "bg-surface text-brand shadow-xl shadow-black/20" : "text-text-muted hover:text-text"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <form onSubmit={onAuthSubmit} className="space-y-5">
            <FormSelect
              label="Select Your Role"
              id="auth-role"
              value={role}
              onChange={(v) => setForms((s) => ({ ...s, authRole: v }))}
              options={[{ value: "admin", label: "Administrator" }, { value: "agent", label: "Support Agent" }, { value: "customer", label: "Customer" }]}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${authMode}-${role}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {authMode === "login" && role !== "customer" && (
                  <FormField label="Company Identifier" id="login-slug" placeholder="e.g. acme-corp" value={forms.login.tenantSlug} onChange={(v) => setForms((s) => ({ ...s, login: { ...s.login, tenantSlug: v } }))} />
                )}
                {authMode === "login" && role === "customer" && (
                  <FormField label="Company Name" id="login-company" placeholder="Enter company you work with" value={forms.login.companyName} onChange={(v) => setForms((s) => ({ ...s, login: { ...s.login, companyName: v } }))} />
                )}

                {authMode === "register" && role === "admin" && (
                  <>
                    <FormField label="Business Name" id="reg-biz" placeholder="Acme Inc." value={forms.register.businessName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, businessName: v } }))} />
                    <FormField label="Company Slug" id="reg-slug" placeholder="acme" value={forms.register.slug} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, slug: v } }))} />
                    <FormField label="Admin Name" id="reg-admin" placeholder="John Doe" value={forms.register.adminName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, adminName: v } }))} />
                  </>
                )}

                {authMode === "register" && role === "agent" && (
                  <>
                    <FormField label="Full Name" id="reg-name" placeholder="John Doe" value={forms.register.name} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, name: v } }))} />
                    <FormField label="Company Slug" id="reg-tenant" placeholder="acme" value={forms.register.tenantSlug} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, tenantSlug: v } }))} />
                  </>
                )}

                {authMode === "register" && role === "customer" && (
                  <>
                    <FormField label="Full Name" id="reg-cust-name" placeholder="John Doe" value={forms.register.name} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, name: v } }))} />
                    <FormField label="Company Name" id="reg-cust-company" placeholder="Acme Inc." value={forms.register.companyName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, companyName: v } }))} />
                  </>
                )}

                <FormField
                  label="Email Address" id="auth-email" type="email" placeholder="john@example.com"
                  value={authMode === "login" ? forms.login.email : forms.register.email}
                  onChange={(v) => setForms((s) => ({ ...s, [authMode]: { ...s[authMode], email: v } }))}
                />
                <FormField
                  label="Password" id="auth-password" type="password" placeholder="••••••••"
                  value={authMode === "login" ? forms.login.password : forms.register.password}
                  onChange={(v) => setForms((s) => ({ ...s, [authMode]: { ...s[authMode], password: v } }))}
                />
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-status-open-bg border border-status-open-border rounded-2xl flex items-center gap-3 text-status-open-text text-xs font-bold">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </motion.div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-4 h-14">
              {submitLabel}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────── */
function Section({ title, icon, children, className = "" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border border-border rounded-[24px] p-6 shadow-xl ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {icon && <div className="text-brand">{icon}</div>}
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">{title}</h2>
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ─── Workspace View ────────────────────────────────────── */
function WorkspaceView({ role, user, workspace, forms, setForms, onLogout, onCreateTicket, onSelectTicket, onSendTicketMessage, onUpdateStatus, onSuggestReplies, onStartChat, onSendChat, onCreateKb, onCreateUser }) {
  const chatEndRef = import.meta.env.SSR ? null : { current: null }; // Fallback for ref in SSR if needed, but we are in client
  const chatContainerRef = { current: null };
  
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll to bottom on new messages
  if (!import.meta.env.SSR) {
    // We can use a simple effect here if this was a standalone component, 
    // but since it's inside AppView, we'll handle it carefully.
  }
  const nav = ["tickets", "chat", "kb"];
  if (role === "admin" || role === "super_admin") nav.unshift("overview");
  if (role === "admin" || role === "super_admin") nav.push("users");
  if (role === "super_admin") nav.push("tenants");

  const selectedTicket = workspace.tickets.find((t) => t._id === workspace.selectedTicketId);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AppShell
      user={user}
      navItems={nav}
      activeSection={workspace.activeSection}
      onNavClick={(item) => workspace.setActiveSection(item)}
      onLogout={onLogout}
    >
      <div className="space-y-8 pb-10">
        {/* Flash messages */}
        <AnimatePresence>
          {(workspace.error || workspace.success) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-2xl px-5 py-4 text-sm font-bold shadow-2xl flex items-center gap-3 border ${
                workspace.error
                  ? "bg-status-open-bg text-status-open-text border-status-open-border"
                  : "bg-status-resolved-bg text-status-resolved-text border-status-resolved-border"
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${workspace.error ? "bg-status-open-text text-white" : "bg-status-resolved-text text-white"}`}>
                {workspace.error ? "!" : "✓"}
              </div>
              {workspace.error || workspace.success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview */}
        {workspace.activeSection === "overview" && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Platform Overview</h1>
                <p className="text-text-muted font-medium">Real-time performance metrics</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-raised rounded-xl border border-white/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-3">
              <MetricCard label="Total Tickets" value={workspace.overview?.total} icon="🎫" color="brand" sub="+12% from last week" />
              <MetricCard label="Resolved" value={workspace.overview?.resolved} icon="✅" color="emerald" sub="98% success rate" />
              <MetricCard label="Escalated" value={workspace.overview?.escalated} icon="⚠️" color="rose" sub="Requires attention" />
            </div>
          </motion.div>
        )}

        {/* Tickets */}
        {workspace.activeSection === "tickets" && (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-8">
              <Section title="New Support Request" icon="✨">
                <form className="space-y-5" onSubmit={onCreateTicket}>
                  <FormField label="Issue Title" id="tk-title" placeholder="Brief summary of the problem" value={forms.ticket.title} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, title: v } }))} />
                  <FormTextarea label="Detailed Description" id="tk-desc" placeholder="Please provide as much detail as possible..." value={forms.ticket.description} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, description: v } }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormSelect label="Priority Level" id="tk-priority" value={forms.ticket.priority} options={priorityOptions} onChange={(v) => setForms((s) => ({ ...s, ticket: { ...s.ticket, priority: v } }))} />
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="w-full">Initialize Ticket</Button>
                </form>
              </Section>

              <Section title="Recent Activity" icon="📋">
                {workspace.tickets.length === 0
                  ? <EmptyState icon="🎫" title="Inbox is clear" description="No active support tickets found." />
                  : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-1 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                      {workspace.tickets.map((ticket) => (
                        <motion.div key={ticket._id} variants={itemVariants}>
                          <TicketCard 
                            ticket={ticket} 
                            selected={workspace.selectedTicketId === ticket._id}
                            onClick={() => onSelectTicket(ticket._id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )
                }
              </Section>
            </div>

            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {selectedTicket ? (
                  <motion.div
                    key={selectedTicket._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <Section title={`Ticket Details — #${selectedTicket.ticketNumber}`} icon="📎">
                      {(role === "admin" || role === "agent" || role === "super_admin") && (
                        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-bg-darker rounded-2xl border border-white/5">
                          <div className="space-y-1 pr-4 border-r border-white/10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</p>
                            <FormSelect
                              id="tk-status"
                              value={selectedTicket.status}
                              options={statusOptions}
                              onChange={(v) => onUpdateStatus(selectedTicket._id, v)}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Actions</p>
                            <Button variant="ghost" size="sm" onClick={onSuggestReplies}>✨ Smart Replies</Button>
                          </div>
                        </div>
                      )}

                      {workspace.suggestedReplies.length > 0 && (
                        <div className="mb-8 space-y-3">
                          <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">AI Suggested Responses</p>
                          <div className="grid gap-2">
                            {workspace.suggestedReplies.map((reply) => (
                              <button
                                key={reply}
                                className="w-full rounded-xl bg-brand/5 border border-brand/20 p-3 text-left text-xs font-bold text-text transition-all hover:bg-brand/10 hover:border-brand/40"
                                onClick={() => setForms((s) => ({ ...s, message: reply }))}
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar p-1">
                        {workspace.ticketMessages.map((m, idx) => (
                          <ChatBubble key={m._id} message={m} currentRole={role} index={idx} />
                        ))}
                        {workspace.ticketMessages.length === 0 && (
                          <div className="py-10 text-center space-y-2">
                            <div className="text-4xl">💬</div>
                            <p className="text-text-muted text-sm font-medium">No messages yet. Start the conversation.</p>
                          </div>
                        )}
                      </div>

                      <form className="mt-8 pt-8 border-t border-white/5 space-y-4" onSubmit={onSendTicketMessage}>
                        <FormTextarea label="Quick Reply" id="tk-reply" rows={3} placeholder="Type your message..." value={forms.message} onChange={(v) => setForms((s) => ({ ...s, message: v }))} />
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-text-muted font-medium italic">Shift + Enter for new line</p>
                          <Button type="submit" variant="primary" size="md">Send Message</Button>
                        </div>
                      </form>
                    </Section>
                  </motion.div>
                ) : (
                  <Section className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-brand/10 flex items-center justify-center text-3xl mb-6 shadow-inner animate-pulse">🎫</div>
                    <h2 className="text-xl font-black text-white">Select a ticket to view thread</h2>
                    <p className="text-text-muted max-w-xs mt-2 font-medium">Choose a ticket from the left panel to manage details and conversation history.</p>
                  </Section>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* AI Chat */}
        {workspace.activeSection === "chat" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">AI Workspace</h1>
                <p className="text-text-muted font-medium">Interactive intelligent assistance</p>
              </div>
              <Button 
                onClick={onStartChat} 
                variant="secondary"
                whileHover={{}}
                whileTap={{ scale: 0.95 }}
                className="!shadow-none !bg-surface-raised active:!bg-surface-active rounded-xl"
              >
                New Session
              </Button>
            </div>

            <Section className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 brand-gradient opacity-5 blur-[100px] pointer-events-none"></div>
              <div className="space-y-6">
                {workspace.chatSession?._id && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full w-fit">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                    </span>
                    <span className="text-[10px] font-black text-brand uppercase">Session Active</span>
                  </div>
                )}
                
                <div className="space-y-6 h-[600px] overflow-y-auto no-scrollbar py-4 px-2 scroll-smooth">
                  {workspace.chatMessages.length === 0
                    ? <EmptyState icon="🤖" title="How can I help you today?" description="Ask me anything about your tickets, workflows, or data." />
                    : workspace.chatMessages.map((m, idx) => (
                        <ChatBubble key={m._id} message={m} currentRole={role} index={idx} />
                      ))
                  }
                  {workspace.loading && workspace.activeSection === "chat" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-4 bg-brand/5 border border-brand/20 rounded-2xl w-fit"
                    >
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-brand" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-brand" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-brand" />
                      </div>
                      <span className="text-[10px] font-black text-brand uppercase tracking-widest">Neural Processing...</span>
                    </motion.div>
                  )}
                  {/* Scroll Anchor */}
                  <div ref={(el) => { if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" }); }} />
                </div>

                <form 
                  className="pt-6 border-t border-white/5" 
                  onSubmit={onSendChat}
                >
                  <div className="flex items-center gap-2 bg-bg-darker p-2 rounded-xl border border-border transition-all focus-within:border-brand/30">
                    <div className="flex-1">
                      <FormTextarea 
                        id="chat-msg" 
                        rows={1} 
                        minimal={true}
                        placeholder="Type your message here..." 
                        value={forms.chat} 
                        onChange={(v) => setForms((s) => ({ ...s, chat: v }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSendChat(e);
                          }
                        }}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      whileHover={{}}
                      whileTap={{ scale: 0.95 }}
                      className="h-10 w-10 !p-0 flex items-center justify-center rounded-lg shrink-0 !bg-bg-darker !text-brand !shadow-none border border-border"
                      disabled={!forms.chat.trim() || workspace.loading}
                    >
                      <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </form>
              </div>
            </Section>
          </div>
        )}

        {/* Knowledge Base */}
        {workspace.activeSection === "kb" && (
          <div className="space-y-8">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Knowledge Base</h1>
                <p className="text-text-muted font-medium">Self-service documentation and guides</p>
              </div>
              <div className="relative">
                <input type="text" placeholder="Search articles..." className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-4 focus:ring-brand-glow focus:border-brand outline-none transition-all w-full sm:w-64" />
                <svg className="absolute left-3 top-3 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {(role === "admin" || role === "super_admin") && (
                <div className="lg:col-span-4">
                  <Section title="Publish Article" icon="✍️">
                    <form className="space-y-5" onSubmit={onCreateKb}>
                      <FormField label="Article Title" id="kb-title" value={forms.kb.title} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, title: v } }))} />
                      <FormTextarea label="Content (Markdown)" id="kb-content" rows={8} value={forms.kb.content} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, content: v } }))} />
                      <FormField label="Tags" id="kb-tags" placeholder="billing, security, api" value={forms.kb.tags} onChange={(v) => setForms((s) => ({ ...s, kb: { ...s.kb, tags: v } }))} />
                      <Button type="submit" variant="primary" size="lg" className="w-full">Publish to Cloud</Button>
                    </form>
                  </Section>
                </div>
              )}
              
              <div className={(role === "admin" || role === "super_admin") ? "lg:col-span-8" : "lg:col-span-12"}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {workspace.kbArticles.length === 0
                    ? <div className="col-span-full"><EmptyState icon="📚" title="No articles found" /></div>
                    : workspace.kbArticles.map((article) => (
                        <motion.div
                          key={article._id}
                          whileHover={{ y: -4 }}
                          className="bg-surface border border-border rounded-2xl p-6 hover:border-brand/40 hover:shadow-2xl transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand text-xl group-hover:brand-gradient group-hover:text-white transition-all">📖</div>
                            <div className="flex gap-1">
                              {article.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-surface-raised text-[9px] font-black text-text-muted uppercase border border-white/5">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand transition-colors">{article.title}</h3>
                          <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4 font-medium">{article.content}</p>
                          <button className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            Read Full Article 
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </button>
                        </motion.div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {workspace.activeSection === "users" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
                <p className="text-text-muted font-medium">Configure roles and permissions</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-4">
                <Section title="Invite New User" icon="👤">
                  <form className="space-y-5" onSubmit={onCreateUser}>
                    <FormField label="Full Name" id="usr-name" placeholder="John Doe" value={forms.user.name} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, name: v } }))} />
                    <FormField label="Email Address" id="usr-email" type="email" placeholder="john@acme.com" value={forms.user.email} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, email: v } }))} />
                    <FormField label="Temporary Password" id="usr-pw" type="password" value={forms.user.password} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, password: v } }))} />
                    <FormSelect label="Assigned Role" id="usr-role" value={forms.user.role} options={userRoleOptions} onChange={(v) => setForms((s) => ({ ...s, user: { ...s.user, role: v } }))} />
                    <Button type="submit" variant="primary" size="lg" className="w-full">Generate Account</Button>
                  </form>
                </Section>
              </div>

              <div className="lg:col-span-8">
                <Section title="Global Users" icon="👥">
                  {workspace.users.length === 0
                    ? <EmptyState icon="👥" title="No users registered" />
                    : (
                      <div className="grid gap-3">
                        {workspace.users.map((u) => (
                          <motion.div
                            key={u._id}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between bg-bg-darker border border-white/5 rounded-2xl p-4 hover:border-brand/30 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center font-black text-brand border border-white/10">{u.name?.[0]}</div>
                              <div>
                                <p className="text-sm font-black text-white">{u.name}</p>
                                <p className="text-xs font-bold text-text-muted">{u.email}</p>
                              </div>
                            </div>
                            <Badge value={u.role} type="status" />
                          </motion.div>
                        ))}
                      </div>
                    )
                  }
                </Section>
              </div>
            </div>
          </div>
        )}

        {/* Tenants */}
        {workspace.activeSection === "tenants" && (
          <div className="space-y-8">
            <h1 className="text-3xl font-black text-white tracking-tight">Tenant Infrastructure</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspace.tenants.length === 0
                ? <div className="col-span-full"><EmptyState icon="🏢" title="No infrastructure nodes" /></div>
                : workspace.tenants.map((tenant) => (
                    <motion.div
                      key={tenant._id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <span className="px-2 py-1 rounded-lg bg-brand/10 text-[9px] font-black text-brand uppercase tracking-tighter border border-brand/20">{tenant.plan}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">{tenant.name}</h3>
                      <p className="text-xs font-mono text-brand mb-4">{tenant.slug}.kora.io</p>
                      
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                          <span>Status</span>
                          <span className="text-emerald-500">Active</span>
                        </div>
                        <div className="h-1 w-full bg-surface-raised rounded-full overflow-hidden">
                          <div className="h-full w-full bg-brand"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))
              }
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export { AuthView, WorkspaceView };

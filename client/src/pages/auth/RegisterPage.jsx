import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";
import Button from "../../components/common/Button";

const pageV   = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.45 } } };
const cardV   = { hidden: { opacity: 0, y: 28, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 24, delay: 0.1 } } };
const panelV  = { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 26, delay: 0.05 } } };
const stagger = { visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const fieldV  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } } };
const groupV  = { enter: (d) => ({ opacity: 0, x: d * 26 }), center: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 340, damping: 28 } }, exit: (d) => ({ opacity: 0, x: d * -26, transition: { duration: 0.15 } }) };
const errV    = { hidden: { opacity: 0, y: -8, height: 0 }, visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.2 } }, exit: { opacity: 0, y: -8, height: 0, transition: { duration: 0.14 } } };

const ROLES = [
  { value: "admin",    label: "Admin" },
  { value: "agent",    label: "Agent" },
  { value: "customer", label: "Customer" },
];
const ROLE_ORDER = ["admin", "agent", "customer"];

function AuthField({ label, id, type = "text", value, onChange, placeholder, required }) {
  return (
    <motion.div variants={fieldV} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label htmlFor={id} className="auth-label">
        {label}{required && <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>}
      </label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        autoComplete={type === "password" ? "new-password" : "on"}
        className="auth-input" />
    </motion.div>
  );
}

export default function RegisterPage() {
  const auth = useAuth();
  const [role, setRole]         = useState("admin");
  const [prevRole, setPrevRole] = useState("admin");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [adminForm, setAdminForm]   = useState({ businessName: "", slug: "", adminName: "", email: "", password: "" });
  const [memberForm, setMemberForm] = useState({ name: "", email: "", password: "", tenantSlug: "", companyName: "" });

  const dir = ROLE_ORDER.indexOf(role) > ROLE_ORDER.indexOf(prevRole) ? 1 : -1;
  function switchRole(r) { setPrevRole(role); setRole(r); }

  function redirectAfterRole(ur) {
    if (ur === "admin" || ur === "super_admin") { window.location.href = "/admin"; return; }
    if (ur === "agent") { window.location.href = "/agent"; return; }
    window.location.href = "/dashboard";
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (role === "admin") {
        const result = await auth.register({ businessName: adminForm.businessName, slug: adminForm.slug, adminName: adminForm.adminName, email: adminForm.email, password: adminForm.password });
        redirectAfterRole(result.user.role); return;
      }
      if (role === "customer") {
        await authService.customerRegister({ name: memberForm.name, email: memberForm.email, password: memberForm.password, companyName: memberForm.companyName });
      } else {
        await authService.agentRegister({ name: memberForm.name, email: memberForm.email, password: memberForm.password, tenantSlug: memberForm.tenantSlug });
      }
      const loginResult = await auth.login(
        role === "customer"
          ? { email: memberForm.email, password: memberForm.password, companyName: memberForm.companyName, role: "customer" }
          : { email: memberForm.email, password: memberForm.password, tenantSlug: memberForm.tenantSlug, role: "agent" }
      );
      redirectAfterRole(loginResult.user.role);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  }

  const ctaLabel = loading ? "Creating…" : role === "admin" ? "Create Workspace" : "Create Account";

  return (
    <motion.div className="auth-root" variants={pageV} initial="hidden" animate="visible">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-3" aria-hidden="true" />

      {/* Brand panel */}
      <motion.div className="auth-brand-panel" variants={panelV} initial="hidden" animate="visible">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1 }}>
          <motion.div className="auth-logo-mark" whileHover={{ rotate: 6, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>K</motion.div>
          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Kora</span>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ position: "relative", zIndex: 1 }}>
          <motion.p variants={fieldV} style={{ color: "rgba(241,245,249,0.95)", fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
            Get started in<br />minutes. No setup<br /><span style={{ color: "#38bdf8" }}>complexity.</span>
          </motion.p>
          <motion.p variants={fieldV} style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 280, marginBottom: "2rem" }}>
            Create your workspace and manage customer support with AI assistance from day one.
          </motion.p>
          {["AI-powered ticket routing", "Real-time collaboration", "Analytics dashboard"].map((f) => (
            <motion.div key={f} variants={fieldV} className="auth-feature" style={{ marginBottom: "0.75rem" }}>
              <div className="auth-feature-dot">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{f}</span>
            </motion.div>
          ))}
          <motion.div variants={fieldV} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1.75rem" }}>
            <div style={{ display: "flex" }}>
              {["#38bdf8","#7dd3fc","#0ea5e9"].map((c, i) => (
                <div key={i} style={{ height: 28, width: 28, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.12)", marginLeft: i === 0 ? 0 : -8 }} />
              ))}
            </div>
            <span style={{ color: "#334155", fontSize: "0.75rem" }}>Trusted by 2,000+ teams</span>
          </motion.div>
        </motion.div>

        <p style={{ color: "#1e293b", fontSize: "0.72rem", position: "relative", zIndex: 1 }}>© {new Date().getFullYear()} Kora Platform</p>
      </motion.div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <motion.div style={{ width: "100%", maxWidth: 400 }} variants={cardV} initial="hidden" animate="visible">
          {/* Mobile logo */}
          <motion.div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}
            className="lg:hidden" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="auth-logo-mark" style={{ height: "2rem", width: "2rem", borderRadius: 8, fontSize: "0.9rem" }}>K</div>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.1rem" }}>Kora</span>
          </motion.div>

          <div className="auth-glass-card">
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "0.3rem" }}>Create account</h1>
              <p style={{ color: "#475569", fontSize: "0.85rem" }}>Choose your role and fill in your details.</p>
            </div>

            {/* Role tabs */}
            <div className="auth-tabs">
              {ROLES.map((r) => (
                <button key={r.value} type="button" className={`auth-tab${role === r.value ? " active" : ""}`} onClick={() => switchRole(r.value)} style={{ position: "relative" }}>
                  {role === r.value && (
                    <motion.span layoutId="register-pill" transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      style={{ position: "absolute", inset: 0, borderRadius: 8, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)", zIndex: -1 }} />
                  )}
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={role} custom={dir} variants={groupV} initial="enter" animate="center" exit="exit">
                  <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {role === "admin" && (<>
                      <AuthField label="Business name" id="reg-biz" value={adminForm.businessName} onChange={(v) => setAdminForm((s) => ({ ...s, businessName: v }))} placeholder="Acme Corp." required />
                      <AuthField label="Workspace slug" id="reg-slug" value={adminForm.slug} onChange={(v) => setAdminForm((s) => ({ ...s, slug: v }))} placeholder="acme-corp" required />
                      <AuthField label="Your name" id="reg-admin-name" value={adminForm.adminName} onChange={(v) => setAdminForm((s) => ({ ...s, adminName: v }))} placeholder="John Doe" required />
                      <AuthField label="Email" id="reg-admin-email" type="email" value={adminForm.email} onChange={(v) => setAdminForm((s) => ({ ...s, email: v }))} placeholder="you@company.com" required />
                      <AuthField label="Password" id="reg-admin-pw" type="password" value={adminForm.password} onChange={(v) => setAdminForm((s) => ({ ...s, password: v }))} placeholder="••••••••" required />
                    </>)}

                    {role === "agent" && (<>
                      <AuthField label="Your name" id="reg-agent-name" value={memberForm.name} onChange={(v) => setMemberForm((s) => ({ ...s, name: v }))} placeholder="Jane Smith" required />
                      <AuthField label="Email" id="reg-agent-email" type="email" value={memberForm.email} onChange={(v) => setMemberForm((s) => ({ ...s, email: v }))} placeholder="you@company.com" required />
                      <AuthField label="Password" id="reg-agent-pw" type="password" value={memberForm.password} onChange={(v) => setMemberForm((s) => ({ ...s, password: v }))} placeholder="••••••••" required />
                      <AuthField label="Company slug" id="reg-agent-slug" value={memberForm.tenantSlug} onChange={(v) => setMemberForm((s) => ({ ...s, tenantSlug: v }))} placeholder="your-company" required />
                    </>)}

                    {role === "customer" && (<>
                      <AuthField label="Your name" id="reg-cust-name" value={memberForm.name} onChange={(v) => setMemberForm((s) => ({ ...s, name: v }))} placeholder="Jane Smith" required />
                      <AuthField label="Email" id="reg-cust-email" type="email" value={memberForm.email} onChange={(v) => setMemberForm((s) => ({ ...s, email: v }))} placeholder="you@company.com" required />
                      <AuthField label="Password" id="reg-cust-pw" type="password" value={memberForm.password} onChange={(v) => setMemberForm((s) => ({ ...s, password: v }))} placeholder="••••••••" required />
                      <AuthField label="Company name" id="reg-cust-company" value={memberForm.companyName} onChange={(v) => setMemberForm((s) => ({ ...s, companyName: v }))} placeholder="Acme Inc." required />
                    </>)}

                  </motion.div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div key="err" variants={errV} initial="hidden" animate="visible" exit="exit"
                    className="auth-error" style={{ marginTop: "1rem" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
                      <path d="M8 5v3.5M8 11h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginTop: "1.25rem" }}>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-[14px]">
                  {ctaLabel}
                </Button>
              </div>
            </form>

            <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.78rem", color: "#334155" }}>
              Already have an account?{" "}
              <motion.a href="/login" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none" }} whileHover={{ color: "#7dd3fc" }} transition={{ duration: 0.15 }}>
                Sign in
              </motion.a>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

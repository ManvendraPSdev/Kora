import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const auth = useAuth();
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function redirectByRole(userRole) {
    if (userRole === "admin" || userRole === "super_admin") {
      window.location.href = "/admin";
      return;
    }
    if (userRole === "agent") {
      window.location.href = "/agent";
      return;
    }
    window.location.href = "/dashboard";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body =
        role === "customer"
          ? { email, password, companyName, role: "customer" }
          : { email, password, tenantSlug, role: role === "admin" ? "admin" : "agent" };
      const result = await auth.login(body);
      redirectByRole(result.user.role);
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Sign in</h2>
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm">
            <span>Role</span>
            <select
              className="rounded border border-slate-300 px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {role !== "customer" && (
            <label className="grid gap-1 text-sm">
              <span>Company slug</span>
              <input
                className="rounded border border-slate-300 px-3 py-2"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
              />
            </label>
          )}
          {role === "customer" && (
            <label className="grid gap-1 text-sm">
              <span>Company name</span>
              <input
                className="rounded border border-slate-300 px-3 py-2"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </label>
          )}
          <label className="grid gap-1 text-sm">
            <span>Email</span>
            <input
              type="email"
              className="rounded border border-slate-300 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Password</span>
            <input
              type="password"
              className="rounded border border-slate-300 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading} type="submit">
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

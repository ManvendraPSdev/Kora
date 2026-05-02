import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";

export default function RegisterPage() {
  const auth = useAuth();
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [adminForm, setAdminForm] = useState({
    businessName: "",
    slug: "",
    adminName: "",
    email: "",
    password: "",
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    password: "",
    tenantSlug: "",
    companyName: "",
  });

  function redirectAfterRole(userRole) {
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
      if (role === "admin") {
        const result = await auth.register({
          businessName: adminForm.businessName,
          slug: adminForm.slug,
          adminName: adminForm.adminName,
          email: adminForm.email,
          password: adminForm.password,
        });
        redirectAfterRole(result.user.role);
        return;
      }

      if (role === "customer") {
        await authService.customerRegister({
          name: memberForm.name,
          email: memberForm.email,
          password: memberForm.password,
          companyName: memberForm.companyName,
        });
      } else {
        await authService.agentRegister({
          name: memberForm.name,
          email: memberForm.email,
          password: memberForm.password,
          tenantSlug: memberForm.tenantSlug,
        });
      }

      const loginResult = await auth.login(
        role === "customer"
          ? {
              email: memberForm.email,
              password: memberForm.password,
              companyName: memberForm.companyName,
              role: "customer",
            }
          : {
              email: memberForm.email,
              password: memberForm.password,
              tenantSlug: memberForm.tenantSlug,
              role: "agent",
            }
      );
      redirectAfterRole(loginResult.user.role);
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Register</h2>
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm">
            <span>Role</span>
            <select
              className="rounded border border-slate-300 px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </select>
          </label>

          {role === "admin" && (
            <>
              <label className="grid gap-1 text-sm">
                <span>Business name</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={adminForm.businessName}
                  onChange={(e) => setAdminForm((s) => ({ ...s, businessName: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Slug</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={adminForm.slug}
                  onChange={(e) => setAdminForm((s) => ({ ...s, slug: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Admin name</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={adminForm.adminName}
                  onChange={(e) => setAdminForm((s) => ({ ...s, adminName: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Email</span>
                <input
                  type="email"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Password</span>
                <input
                  type="password"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((s) => ({ ...s, password: e.target.value }))}
                  required
                />
              </label>
            </>
          )}

          {role === "agent" && (
            <>
              <label className="grid gap-1 text-sm">
                <span>Name</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Email</span>
                <input
                  type="email"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Password</span>
                <input
                  type="password"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={memberForm.password}
                  onChange={(e) => setMemberForm((s) => ({ ...s, password: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Company slug</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  placeholder="Enter your company slug"
                  value={memberForm.tenantSlug}
                  onChange={(e) => setMemberForm((s) => ({ ...s, tenantSlug: e.target.value }))}
                  required
                />
              </label>
            </>
          )}

          {role === "customer" && (
            <>
              <label className="grid gap-1 text-sm">
                <span>Name</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Email</span>
                <input
                  type="email"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Password</span>
                <input
                  type="password"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={memberForm.password}
                  onChange={(e) => setMemberForm((s) => ({ ...s, password: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Company name</span>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  placeholder="Business name of your company"
                  value={memberForm.companyName}
                  onChange={(e) => setMemberForm((s) => ({ ...s, companyName: e.target.value }))}
                  required
                />
              </label>
            </>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading} type="submit">
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

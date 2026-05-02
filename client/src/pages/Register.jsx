import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";
import SocialAuth from "../components/SocialAuth";

export default function Register({ forms, setForms, onAuthSubmit, loading, error, setAuthMode }) {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-400">Fill in the details below to get started.</p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={onAuthSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Business" value={forms.register.businessName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, businessName: v } }))} />
            <InputField label="Slug" value={forms.register.slug} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, slug: v } }))} />
          </div>
          <InputField label="Admin Name" value={forms.register.adminName} onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, adminName: v } }))} />
          
          <InputField
            label="Email"
            type="email"
            value={forms.register.email}
            onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, email: v } }))}
          />
          <InputField
            label="Password"
            type="password"
            value={forms.register.password}
            onChange={(v) => setForms((s) => ({ ...s, register: { ...s.register, password: v } }))}
          />

          <AuthButton text={loading ? "Please wait..." : "Sign Up"} disabled={loading} type="submit" />
        </form>

        <SocialAuth />

        <AuthFooter authMode="register" setAuthMode={setAuthMode} />
        {error ? <p className="mt-2 text-sm text-rose-600 text-center">{error}</p> : null}
      </div>
    </AuthLayout>
  );
}

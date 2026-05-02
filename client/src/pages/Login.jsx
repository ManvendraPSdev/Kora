import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import AuthButton from "../components/AuthButton";
import AuthFooter from "../components/AuthFooter";
import SocialAuth from "../components/SocialAuth";

export default function Login({ forms, setForms, onAuthSubmit, loading, error, setShowReset, setAuthMode }) {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-400">Enter your credentials to access your account.</p>
        </div>

        <form className="space-y-4" onSubmit={onAuthSubmit}>
          <InputField
            label="Email"
            type="email"
            value={forms.login.email}
            onChange={(v) => setForms((s) => ({ ...s, login: { ...s.login, email: v } }))}
          />
          <div className="space-y-1">
            <InputField
              label="Password"
              type="password"
              value={forms.login.password}
              onChange={(v) => setForms((s) => ({ ...s, login: { ...s.login, password: v } }))}
            />
            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="text-sm text-slate-400 hover:text-slate-100 transition duration-200"
                onClick={() => setShowReset(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <AuthButton text={loading ? "Please wait..." : "Sign In"} disabled={loading} type="submit" />
        </form>

        <SocialAuth />

        <AuthFooter authMode="login" setAuthMode={setAuthMode} />
        {error ? <p className="mt-2 text-sm text-rose-600 text-center">{error}</p> : null}
      </div>
    </AuthLayout>
  );
}

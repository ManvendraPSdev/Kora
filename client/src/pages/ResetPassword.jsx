import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import AuthButton from "../components/AuthButton";

export default function ResetPassword({ forms, setForms, onForgotPassword, onResetPassword, error, setShowReset }) {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-400">Enter your email and reset token to set a new password.</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <InputField
            label="Email"
            value={forms.reset.email}
            onChange={(v) => setForms((s) => ({ ...s, reset: { ...s.reset, email: v } }))}
          />
          <InputField
            label="Token"
            value={forms.reset.token}
            onChange={(v) => setForms((s) => ({ ...s, reset: { ...s.reset, token: v } }))}
          />
          <InputField
            label="New Password"
            type="password"
            value={forms.reset.newPassword}
            onChange={(v) => setForms((s) => ({ ...s, reset: { ...s.reset, newPassword: v } }))}
          />
          
          <div className="grid gap-3 pt-2">
            <AuthButton text="Request reset token" onClick={onForgotPassword} />
            <AuthButton text="Apply new password" onClick={onResetPassword} />
          </div>
        </form>
        
        {error ? <p className="text-sm text-rose-600 text-center">{error}</p> : null}
        
        <div className="text-center mt-6">
          <button
            type="button"
            className="text-sm text-slate-400 hover:text-slate-100 transition duration-200"
            onClick={() => setShowReset(false)}
          >
            &larr; Back to Sign In
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

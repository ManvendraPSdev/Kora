export default function AuthFooter({ authMode, setAuthMode }) {
  return (
    <div className="text-center text-sm text-slate-400 mt-6">
      {authMode === "login" ? (
        <>
          Don't have an account?{" "}
          <button
            type="button"
            className="font-medium text-slate-100 hover:underline"
            onClick={() => setAuthMode("register")}
          >
            Sign Up
          </button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-slate-100 hover:underline"
            onClick={() => setAuthMode("login")}
          >
            Sign In
          </button>
        </>
      )}
    </div>
  );
}

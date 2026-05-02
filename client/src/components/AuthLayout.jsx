export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-0 text-slate-200">
      <div className="w-full max-w-md h-screen sm:h-[800px] flex flex-col justify-center p-6 sm:p-12 bg-slate-900 border-x border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}

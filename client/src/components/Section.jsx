export default function Section({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-4 sm:p-6 text-slate-200 ${className}`}>
      <h2 className="mb-4 text-lg sm:text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

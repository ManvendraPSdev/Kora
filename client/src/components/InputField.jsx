export default function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
      <span>{label}</span>
      <input
        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-200"
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export default function SelectField({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
      <span>{label}</span>
      <select
        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition duration-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option value={option} key={option} className="bg-slate-900 text-slate-100">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

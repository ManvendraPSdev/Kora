export default function FormSelect({ label, value, onChange, options, id, required = false }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
          {label}
          {required && <span className="ml-1 text-status-open-text">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full appearance-none px-4 py-2.5 bg-bg-darker border border-border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-glow hover:border-border-strong cursor-pointer"
        >
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt.replace(/_/g, " ") : opt.label;
            return (
              <option value={val} key={val} className="bg-surface text-text">
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

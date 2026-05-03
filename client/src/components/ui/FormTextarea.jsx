export default function FormTextarea({ label, value, onChange, onKeyDown, rows = 4, placeholder = "", id, required = false, minimal = false }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
          {label}
          {required && <span className="ml-1 text-status-open-text">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-2.5 bg-bg-darker border border-border rounded-xl text-sm transition-all duration-200 
          focus:outline-none resize-none
          ${minimal 
            ? "focus:border-brand/30 hover:border-border" 
            : "focus:border-brand focus:ring-4 focus:ring-brand-glow hover:border-border-strong"
          }
        `}
      />
    </div>
  );
}

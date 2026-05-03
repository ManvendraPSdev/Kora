export default function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  error = "",
  id,
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
          {label}
          {required && <span className="ml-1 text-status-open-text">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 bg-bg-darker border rounded-xl text-sm transition-all duration-200
          ${error ? "border-status-open-border focus:ring-status-open-border" : "border-border focus:border-brand focus:ring-4 focus:ring-brand-glow"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-border-strong"}
        `}
      />
      {error && <p className="text-[10px] font-bold text-status-open-text ml-1 uppercase">{error}</p>}
    </div>
  );
}

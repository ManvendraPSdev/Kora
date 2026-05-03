/**
 * Toast — slide-in notification banner.
 * Variants: success | error | info | warning
 */
const VARIANTS = {
  success: {
    bar: "bg-emerald-500",
    bg:  "bg-emerald-50 border-emerald-200 text-emerald-900",
    icon: "✓",
    iconClass: "bg-emerald-500 text-white",
  },
  error: {
    bar: "bg-rose-500",
    bg:  "bg-rose-50 border-rose-200 text-rose-900",
    icon: "✕",
    iconClass: "bg-rose-500 text-white",
  },
  info: {
    bar: "bg-[--brand]",
    bg:  "bg-[--brand-light] border-[--brand-muted] text-[--brand-dark]",
    icon: "i",
    iconClass: "bg-[--brand] text-white",
  },
  warning: {
    bar: "bg-amber-500",
    bg:  "bg-amber-50 border-amber-200 text-amber-900",
    icon: "!",
    iconClass: "bg-amber-500 text-white",
  },
};

export default function Toast({ message, variant = "info", visible = true }) {
  if (!message || !visible) return null;
  const v = VARIANTS[variant] ?? VARIANTS.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed right-4 top-4 z-[200] flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg max-w-xs animate-slide-in ${v.bg}`}
    >
      {/* color bar */}
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${v.iconClass}`}>
        {v.icon}
      </span>
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
    </div>
  );
}

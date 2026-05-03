/**
 * EmptyState — illustrated placeholder for empty lists/sections.
 */
export default function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description = "",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-in">
      <div className="text-5xl opacity-50 select-none">{icon}</div>
      <p className="text-base font-semibold text-[--text]">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-[--text-muted]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

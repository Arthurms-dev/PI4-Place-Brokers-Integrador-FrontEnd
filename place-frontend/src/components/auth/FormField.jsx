export function FormField({ label, error, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {label}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
    </label>
  );
}

export function fieldInputClass(error) {
  return [
    "h-10 w-full rounded-lg border bg-card-2 px-3.5 text-sm text-ink outline-none placeholder:text-ink-3",
    error ? "border-danger" : "border-line focus:border-gold",
  ].join(" ");
}
export default function EquityLoading({ label = "Loading equity data…", inline = false, iconOnly = false }) {
  return (
    <span role="status" className={inline ? "inline-flex items-center justify-center gap-2" : "flex min-h-[60vh] flex-col items-center justify-center gap-4 p-10"}>
      <span aria-hidden="true" className={`shrink-0 animate-spin rounded-full border-solid border-t-transparent ${inline ? "h-5 w-5 border-2 border-current border-t-transparent" : "h-12 w-12 border-4 border-blue-600 border-t-transparent"}`} />
      <span className={iconOnly ? "sr-only" : inline ? "text-sm" : "animate-pulse text-xs font-bold uppercase tracking-widest text-gray-500"}>{label}</span>
    </span>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-xs text-ink/50 mt-1 block">{hint}</span>}
    </label>
  );
}

export const inputCls = "w-full border border-concrete-300 rounded px-3.5 py-2.5 text-sm bg-white focus-ring focus:border-steel";

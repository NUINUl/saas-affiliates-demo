type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function MetricCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{hint}</p>
      ) : null}
    </div>
  );
}

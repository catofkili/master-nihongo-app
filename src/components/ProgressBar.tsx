interface ProgressBarProps {
  value: number;
  label?: string;
}

export const ProgressBar = ({ value, label }: ProgressBarProps) => (
  <div className="space-y-2">
    {label && (
      <div className="flex items-center justify-between text-sm text-stone-600 dark:text-zinc-400">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
    )}
    <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

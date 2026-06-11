import { ArrowRight, CheckCircle2 } from "lucide-react";
import { GrammarPoint, MasteryStatus } from "../types/grammar";

const statusLabel: Record<MasteryStatus, string> = {
  new: "New",
  learning: "Learning",
  familiar: "Familiar",
  mastered: "Mastered"
};

interface GrammarCardProps {
  point: GrammarPoint;
  mastery: MasteryStatus;
  onOpen: (id: string) => void;
  onMarkLearned?: (id: string) => void;
}

export const GrammarCard = ({ point, mastery, onOpen, onMarkLearned }: GrammarCardProps) => (
  <article
    className="focus-ring group flex h-full w-full flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
  >
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {point.level}
          </p>
          <h3 className="jp mt-1 text-2xl font-bold text-stone-950 dark:text-zinc-50">
            {point.title}
          </h3>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
          {statusLabel[mastery]}
        </span>
      </div>
      <p className="text-sm text-stone-700 dark:text-zinc-300">{point.meaning}</p>
      <p className="jp rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
        {point.structure}
      </p>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
      <button
        onClick={() => onOpen(point.id)}
        className="focus-ring inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
      >
        Study <ArrowRight size={15} className="transition group-hover:translate-x-1" />
      </button>
      {onMarkLearned && (
        <button
          onClick={() => onMarkLearned(point.id)}
          className={`focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold ${
            mastery === "new"
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <CheckCircle2 size={14} />
          {mastery === "new" ? "Mark" : "Learned"}
        </button>
      )}
    </div>
  </article>
);

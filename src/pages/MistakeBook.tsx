import { CheckCircle2, Trash2 } from "lucide-react";
import { grammarPoints } from "../data/grammar";
import { MistakeItem } from "../types/grammar";

interface MistakeBookProps {
  mistakes: MistakeItem[];
  onRemove: (id: string) => void;
}

export const MistakeBook = ({ mistakes, onRemove }: MistakeBookProps) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">Mistake Book</h1>
      <p className="mt-2 text-stone-600 dark:text-zinc-400">错题会自动存到这里，答对后可以移除。</p>
    </div>
    {mistakes.length === 0 ? (
      <div className="rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <CheckCircle2 className="mx-auto text-emerald-500" size={34} />
        <p className="mt-3 font-semibold text-stone-800 dark:text-zinc-200">还没有错题。</p>
      </div>
    ) : (
      <div className="grid gap-4">
        {mistakes.map((mistake) => {
          const point = grammarPoints.find((item) => item.id === mistake.grammarId);
          return (
            <article key={mistake.id} className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <p className="jp text-2xl font-bold text-stone-950 dark:text-zinc-50">{point?.title}</p>
                  <p className="mt-2 text-stone-700 dark:text-zinc-300">{mistake.prompt}</p>
                </div>
                <button onClick={() => onRemove(mistake.id)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold hover:bg-stone-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  <Trash2 size={15} />
                  Remove after retry
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-950 dark:text-rose-200">
                  你的答案：{mistake.userAnswer}
                </p>
                <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  正确答案：{mistake.correctAnswer}
                </p>
              </div>
              <p className="mt-3 text-sm text-stone-600 dark:text-zinc-400">{mistake.explanation}</p>
            </article>
          );
        })}
      </div>
    )}
  </div>
);

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GrammarCard } from "../components/GrammarCard";
import { grammarPoints } from "../data/grammar";
import { JLPTLevel, MasteryStatus } from "../types/grammar";

interface LibraryProps {
  getMastery: (id: string) => MasteryStatus;
  onOpenGrammar: (id: string) => void;
  onMarkLearned: (id: string) => void;
}

const levels: ("All" | JLPTLevel)[] = ["All", "N5", "N4", "N3", "N2", "N1"];

export const Library = ({ getMastery, onOpenGrammar, onMarkLearned }: LibraryProps) => {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"All" | JLPTLevel>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grammarPoints.filter((point) => {
      const matchesLevel = level === "All" || point.level === level;
      const haystack = `${point.title} ${point.meaning} ${point.structure}`.toLowerCase();
      return matchesLevel && (!q || haystack.includes(q));
    });
  }, [query, level]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">Grammar Library</h1>
        <p className="mt-2 text-stone-600 dark:text-zinc-400">按 JLPT、意思或结构快速找到一个语法点。</p>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 text-stone-400" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="focus-ring w-full rounded-md border border-stone-300 bg-white py-2.5 pl-10 pr-3 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Search title, meaning, structure"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {levels.map((item) => (
            <button
              key={item}
              onClick={() => setLevel(item)}
              className={`focus-ring rounded-md px-4 py-2 text-sm font-semibold ${
                level === item
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((point) => (
          <GrammarCard
            key={point.id}
            point={point}
            mastery={getMastery(point.id)}
            onOpen={onOpenGrammar}
            onMarkLearned={onMarkLearned}
          />
        ))}
      </div>
    </div>
  );
};

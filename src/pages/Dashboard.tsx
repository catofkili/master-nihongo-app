import { BookOpen, Brain, Clock, Sparkles, TriangleAlert } from "lucide-react";
import { ReactNode } from "react";
import { grammarPoints } from "../data/grammar";
import { ProgressBar } from "../components/ProgressBar";
import { GrammarCard } from "../components/GrammarCard";
import { MasteryStatus } from "../types/grammar";

interface DashboardProps {
  reviewCount: number;
  mistakeCount: number;
  levelProgress: { level: string; done: number; total: number }[];
  getMastery: (id: string) => MasteryStatus;
  onOpenGrammar: (id: string) => void;
  onMarkLearned: (id: string) => void;
  onStartSession: () => void;
}

export const Dashboard = ({
  reviewCount,
  mistakeCount,
  levelProgress,
  getMastery,
  onOpenGrammar,
  onMarkLearned,
  onStartSession
}: DashboardProps) => {
  const todaysNew = grammarPoints.filter((point) => getMastery(point.id) === "new").slice(0, 4);
  const n5Count = grammarPoints.filter((point) => point.level === "N5").length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles size={16} />
            Daily training
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950 dark:text-zinc-50">
            今天用 10 分钟，把语法变成手感。
          </h1>
          <p className="mt-3 max-w-2xl text-stone-600 dark:text-zinc-400">
            每张卡只讲一个点：看例句，拆句子，做小测，再把薄弱点丢进复习队列。
          </p>
          <button
            onClick={onStartSession}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            <Clock size={18} />
            Start 10-minute session
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat icon={<BookOpen size={18} />} label="Today new" value={todaysNew.length} />
          <Stat icon={<Brain size={18} />} label="Reviews" value={reviewCount} />
          <Stat icon={<TriangleAlert size={18} />} label="Mistakes" value={mistakeCount} />
          <Stat icon={<Sparkles size={18} />} label="N5 points" value={n5Count} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-stone-950 dark:text-zinc-50">Today's new grammar</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {todaysNew.map((point) => (
            <GrammarCard
              key={point.id}
              point={point}
              mastery={getMastery(point.id)}
              onOpen={onOpenGrammar}
              onMarkLearned={onMarkLearned}
            />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-stone-950 dark:text-zinc-50">JLPT progress</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {levelProgress.map((item) => (
            <ProgressBar
              key={item.level}
              label={`${item.level} ${item.done}/${item.total}`}
              value={item.total ? (item.done / item.total) * 100 : 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: ReactNode; label: string; value: number }) => (
  <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
    <div className="text-emerald-700 dark:text-emerald-400">{icon}</div>
    <p className="mt-4 text-3xl font-bold text-stone-950 dark:text-zinc-50">{value}</p>
    <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">{label}</p>
  </div>
);

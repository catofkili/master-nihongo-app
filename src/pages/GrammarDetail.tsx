import { ArrowLeft, Dumbbell } from "lucide-react";
import { ExampleSentence } from "../components/ExampleSentence";
import { QuizCard } from "../components/QuizCard";
import { ReviewButton } from "../components/ReviewButton";
import { grammarPoints } from "../data/grammar";
import { MasteryStatus } from "../types/grammar";

interface GrammarDetailProps {
  grammarId: string;
  getMastery: (id: string) => MasteryStatus;
  onBack: () => void;
  onPractice: () => void;
  onLearned: (id: string) => void;
  onReview: (id: string) => void;
  onMistake: (grammarId: string, questionId: string, prompt: string, userAnswer: string, correctAnswer: string, explanation: string) => void;
}

export const GrammarDetail = ({
  grammarId,
  getMastery,
  onBack,
  onPractice,
  onLearned,
  onReview,
  onMistake
}: GrammarDetailProps) => {
  const point = grammarPoints.find((item) => item.id === grammarId) ?? grammarPoints[0];
  const mastery = getMastery(point.id);

  return (
    <div className="space-y-7">
      <button onClick={onBack} className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-50">
        <ArrowLeft size={16} />
        Back
      </button>
      <section className="rounded-lg border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{point.level} · {mastery}</p>
            <h1 className="jp mt-2 text-5xl font-bold text-stone-950 dark:text-zinc-50">{point.title}</h1>
            <p className="mt-3 text-xl text-stone-700 dark:text-zinc-300">{point.meaning}</p>
            <p className="jp mt-4 inline-block rounded-md bg-stone-100 px-3 py-2 text-stone-700 dark:bg-zinc-800 dark:text-zinc-200">{point.structure}</p>
          </div>
          <div className="space-y-3">
            <ReviewButton learned={mastery !== "new"} onLearned={() => onLearned(point.id)} onReview={() => onReview(point.id)} />
            <button onClick={onPractice} className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
              <Dumbbell size={16} />
              Practice now
            </button>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-stone-700 dark:text-zinc-300">{point.explanation}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-stone-950 dark:text-zinc-50">Examples</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {point.examples.map((example) => (
            <ExampleSentence key={example.japanese} example={example} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-stone-950 dark:text-zinc-50">Confusing comparisons</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {point.comparisons.map((comparison) => (
            <span key={comparison} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {comparison}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-stone-950 dark:text-zinc-50">Mini quiz</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {point.quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              question={quiz}
              onAnswer={(isCorrect, userAnswer) => {
                if (!isCorrect) onMistake(point.id, quiz.id, quiz.prompt, userAnswer, String(quiz.answer), quiz.explanation);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

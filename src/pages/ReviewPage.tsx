import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { grammarPoints } from "../data/grammar";
import { ReviewItem } from "../types/grammar";

interface ReviewPageProps {
  dueReviews: ReviewItem[];
  onReviewResult: (grammarId: string, isCorrect: boolean) => void;
  onMistake: (grammarId: string, questionId: string, prompt: string, userAnswer: string, correctAnswer: string, explanation: string) => void;
}

export const ReviewPage = ({ dueReviews, onReviewResult, onMistake }: ReviewPageProps) => {
  const queue = useMemo(
    () =>
      dueReviews
        .map((item) => ({
          review: item,
          point: grammarPoints.find((point) => point.id === item.grammarId)
        }))
        .filter((item) => item.point),
    [dueReviews]
  );
  const [position, setPosition] = useState(0);
  const current = queue[position];

  const answer = (isCorrect: boolean) => {
    if (!current?.point) return;
    const quiz = current.point.quizzes[0];
    onReviewResult(current.point.id, isCorrect);
    if (!isCorrect) {
      onMistake(current.point.id, quiz.id, quiz.prompt, "复习时答错", String(quiz.answer), quiz.explanation);
    }
    setPosition((value) => Math.min(value + 1, queue.length));
  };

  if (!current?.point) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-stone-950 dark:text-zinc-50">Review clear</h1>
        <p className="mt-2 text-stone-600 dark:text-zinc-400">今天没有到期复习。可以去 Library 加几个语法点。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">Review</h1>
        <p className="mt-2 text-stone-600 dark:text-zinc-400">
          {position + 1}/{queue.length} · 当前阶段：{current.review.status}
        </p>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{current.point.level}</p>
        <h2 className="jp mt-3 text-6xl font-bold text-stone-950 dark:text-zinc-50">{current.point.title}</h2>
        <p className="mt-5 text-xl text-stone-700 dark:text-zinc-300">{current.point.meaning}</p>
        <p className="jp mt-4 rounded-md bg-stone-100 px-4 py-3 text-stone-700 dark:bg-zinc-800 dark:text-zinc-200">
          {current.point.examples[0].japanese}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => answer(false)} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-500">
            <X size={18} />
            Wrong
          </button>
          <button onClick={() => answer(true)} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500">
            <Check size={18} />
            Correct
          </button>
        </div>
      </div>
    </div>
  );
};

import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { QuizCard } from "../components/QuizCard";
import { grammarPoints } from "../data/grammar";

interface QuizPageProps {
  onMistake: (grammarId: string, questionId: string, prompt: string, userAnswer: string, correctAnswer: string, explanation: string) => void;
}

export const QuizPage = ({ onMistake }: QuizPageProps) => {
  const allQuestions = useMemo(
    () =>
      grammarPoints.flatMap((point) =>
        point.quizzes.map((quiz) => ({ point, quiz }))
      ),
    []
  );
  const [index, setIndex] = useState(() => Math.floor(Math.random() * allQuestions.length));
  const current = allQuestions[index];

  const next = () => setIndex(Math.floor(Math.random() * allQuestions.length));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">Random Quiz</h1>
          <p className="mt-2 text-stone-600 dark:text-zinc-400">
            当前语法：<span className="jp font-semibold">{current.point.title}</span>
          </p>
        </div>
        <button onClick={next} className="focus-ring inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <Shuffle size={16} />
          Next
        </button>
      </div>
      <QuizCard
        question={current.quiz}
        onAnswer={(isCorrect, userAnswer) => {
          if (!isCorrect) {
            onMistake(
              current.point.id,
              current.quiz.id,
              current.quiz.prompt,
              userAnswer,
              String(current.quiz.answer),
              current.quiz.explanation
            );
          }
        }}
      />
    </div>
  );
};

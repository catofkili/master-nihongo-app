import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { QuizQuestion } from "../types/grammar";

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer?: (isCorrect: boolean, userAnswer: string) => void;
}

export const QuizCard = ({ question, onAnswer }: QuizCardProps) => {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const correctText = String(question.answer);
  const isCorrect =
    question.type === "boolean"
      ? answer === correctText
      : answer.trim().toLowerCase() === correctText.toLowerCase();

  const submit = () => {
    if (!answer) return;
    setSubmitted(true);
    onAnswer?.(isCorrect, answer);
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Quiz</p>
      <h3 className="jp mt-2 text-lg font-semibold text-stone-950 dark:text-zinc-50">
        {question.prompt}
      </h3>
      <div className="mt-4 space-y-3">
        {question.type === "choice" &&
          question.options?.map((option) => (
            <button
              key={option}
              className={`focus-ring block w-full rounded-md border px-4 py-3 text-left text-sm ${
                answer === option
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                  : "border-stone-200 hover:bg-stone-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
              onClick={() => setAnswer(option)}
            >
              {option}
            </button>
          ))}
        {question.type === "boolean" && (
          <div className="grid grid-cols-2 gap-3">
            {["true", "false"].map((value) => (
              <button
                key={value}
                className={`focus-ring rounded-md border px-4 py-3 text-sm ${
                  answer === value
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                    : "border-stone-200 hover:bg-stone-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
                onClick={() => setAnswer(value)}
              >
                {value === "true" ? "正确" : "错误"}
              </button>
            ))}
          </div>
        )}
        {question.type === "input" && (
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="focus-ring w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="输入答案"
          />
        )}
        {!submitted && (
          <button
            className="focus-ring rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
            onClick={submit}
          >
            Submit
          </button>
        )}
      </div>
      {submitted && (
        <div
          className={`mt-4 rounded-md p-4 text-sm ${
            isCorrect
              ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
              : "bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200"
          }`}
        >
          <div className="mb-2 flex items-center gap-2 font-semibold">
            {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isCorrect ? "答对了" : `正确答案：${correctText}`}
          </div>
          {question.explanation}
        </div>
      )}
    </div>
  );
};

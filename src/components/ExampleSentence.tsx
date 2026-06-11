import { ExampleSentence as Example } from "../types/grammar";

interface ExampleSentenceProps {
  example: Example;
}

export const ExampleSentence = ({ example }: ExampleSentenceProps) => (
  <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="jp text-2xl font-semibold leading-relaxed text-stone-950 dark:text-zinc-50">
      {example.japanese}
    </p>
    <p className="jp mt-2 text-sm text-stone-500 dark:text-zinc-400">{example.reading}</p>
    <p className="mt-3 text-stone-700 dark:text-zinc-300">{example.chinese}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {example.notes.map((note) => (
        <span
          key={`${example.japanese}-${note.text}`}
          title={note.note}
          className="jp cursor-help rounded-md bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {note.text}
        </span>
      ))}
    </div>
  </div>
);

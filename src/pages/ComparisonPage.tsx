import { useMemo, useState } from "react";
import { ComparisonTable } from "../components/ComparisonTable";
import { grammarPoints, presetComparisons } from "../data/grammar";

export const ComparisonPage = () => {
  const [leftId, setLeftId] = useState("wa");
  const [rightId, setRightId] = useState("ga");
  const [presetId, setPresetId] = useState("wa-ga");

  const preset = presetComparisons.find((item) => item.id === presetId) ?? presetComparisons[0];
  const left = grammarPoints.find((point) => point.id === leftId) ?? grammarPoints[0];
  const right = grammarPoints.find((point) => point.id === rightId) ?? grammarPoints[1];

  const customText = useMemo(
    () => ({
      usage: `${left.title}：${left.meaning}。${right.title}：${right.meaning}。`,
      nuance: `${left.explanation} ${right.explanation}`,
      structure: `${left.structure} / ${right.structure}`,
      examples: [left.examples[0].japanese, right.examples[0].japanese]
    }),
    [left, right]
  );

  const presetLeft = grammarPoints.find((point) => point.id === preset.leftId) ?? left;
  const presetRight = grammarPoints.find((point) => point.id === preset.rightId) ?? right;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">Comparison</h1>
        <p className="mt-2 text-stone-600 dark:text-zinc-400">把容易混的语法放在一起看，不用在脑子里打结。</p>
      </div>
      <section className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-bold text-stone-950 dark:text-zinc-50">Preset comparisons</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {presetComparisons.map((item) => (
            <button
              key={item.id}
              onClick={() => setPresetId(item.id)}
              className={`focus-ring rounded-md px-4 py-2 text-sm font-semibold ${
                presetId === item.id
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </section>
      <ComparisonTable
        left={presetLeft}
        right={presetRight}
        usage={preset.usage}
        nuance={preset.nuance}
        structure={preset.structure}
        examples={preset.examples}
      />
      <section className="rounded-lg border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-bold text-stone-950 dark:text-zinc-50">Custom compare</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[leftId, rightId].map((value, index) => (
            <select
              key={index}
              value={value}
              onChange={(event) => (index === 0 ? setLeftId(event.target.value) : setRightId(event.target.value))}
              className="focus-ring rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {grammarPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.title} · {point.meaning}
                </option>
              ))}
            </select>
          ))}
        </div>
      </section>
      <ComparisonTable
        left={left}
        right={right}
        usage={customText.usage}
        nuance={customText.nuance}
        structure={customText.structure}
        examples={customText.examples}
      />
    </div>
  );
};

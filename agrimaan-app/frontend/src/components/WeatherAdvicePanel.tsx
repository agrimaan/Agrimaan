import React from "react";
import type { WeatherAdvice } from "../services/ai";

type Props = {
  advice?: WeatherAdvice | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  fieldName?: string;
};

export default function WeatherAdvicePanel({ advice, loading, error, onRefresh, fieldName }: Props) {
  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          AI Weather Advice{fieldName ? ` — ${fieldName}` : ""}
        </h3>
        <button
          onClick={onRefresh}
          className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      {loading && <p>Analyzing latest forecast…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && advice && (
        <div className="space-y-3">
          <p className="whitespace-pre-wrap">{advice.summary}</p>

          {advice.risks?.length ? (
            <div>
              <h4 className="font-medium">Risks</h4>
              <ul className="list-disc ml-5">
                {advice.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {advice.recommendations?.length ? (
            <div>
              <h4 className="font-medium">Recommendations</h4>
              <ul className="list-disc ml-5">
                {advice.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {advice.warnings?.length ? (
            <div>
              <h4 className="font-medium text-amber-700">Warnings</h4>
              <ul className="list-disc ml-5">
                {advice.warnings.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

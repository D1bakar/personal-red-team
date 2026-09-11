"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, History, Loader2, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

function levelBadge(level: string) {
  switch ((level || "").toLowerCase()) {
    case "high":
      return "badge-rose";
    case "medium":
      return "badge-amber";
    case "low":
      return "badge-emerald";
    default:
      return "badge-slate";
  }
}

export default function ThreatsPage() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api
      .getThreatHistory()
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await api.analyzeThreat(input.trim());
      setAnalysis(data);
      setInput("");
      setHistory((prev) => [data, ...prev]);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Threat analyzer"
        subtitle="Paste any suspicious message — get an instant, calm read."
      />

      {/* Input */}
      <div className="card p-6 animate-fade-up">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="label" htmlFor="threat-input">Suspicious message</label>
            <textarea
              id="threat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input min-h-[130px] resize-y leading-relaxed"
              placeholder="Paste the email, SMS, or chat message here…"
              required
              maxLength={5000}
            />
            <div className="mt-1 text-right font-mono text-[11px] text-ink-400">
              {input.length}/5000
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ScanSearch size={15} />}
            {loading ? "Analyzing…" : "Analyze message"}
          </button>
        </form>
      </div>

      {/* Result */}
      {analysis && (
        <div className="card overflow-hidden animate-pop">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold tracking-tight">
              <Sparkles size={16} className="text-teal-600" />
              Analysis result
            </h2>
            <button onClick={() => setAnalysis(null)} className="btn-ghost !px-3 !py-1.5 !text-xs">
              Dismiss
            </button>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn("!text-xs", levelBadge(analysis.threat_level))}>
                {analysis.threat_level || "unknown"} risk
              </span>
              <span className="font-mono text-sm font-semibold">
                {Math.round((analysis.threat_score || 0) * 100)}%
              </span>
              <span className="text-xs text-ink-400">confidence-weighted threat score</span>
            </div>

            {analysis.flagged_phrases?.length > 0 && (
              <div className="panel p-4">
                <p className="label">Flagged phrases</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.flagged_phrases.map((p: string) => (
                    <span key={p} className="badge-rose !font-normal">“{p}”</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="panel p-4">
                <p className="label">What to do</p>
                <ul className="space-y-1.5">
                  {analysis.recommendations.map((r: string) => (
                    <li key={r} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                      <ShieldCheck size={15} className="mt-0.5 shrink-0 text-teal-600" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <div className="card p-6 animate-fade-up stagger-2">
        <h2 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
          <History size={16} className="text-ink-400" />
          Past analyses
        </h2>
        {fetching ? (
          <div className="space-y-2.5">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Nothing analyzed yet"
            hint="Every message you check makes the next one easier to judge."
          />
        ) : (
          <div className="space-y-2.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-slate-200/70 bg-white px-4 py-3 transition-colors hover:border-slate-300"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={levelBadge(h.threat_level)}>{h.threat_level}</span>
                    <span className="font-mono text-xs font-semibold">
                      {Math.round((h.threat_score || 0) * 100)}%
                    </span>
                  </div>
                  <span className="text-xs text-ink-400">
                    {h.analyzed_at ? new Date(h.analyzed_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="line-clamp-2 text-[13px] text-ink-500">{h.input_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

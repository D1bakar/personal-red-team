"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ThreatsPage() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.getThreatHistory().then((data) => setHistory(Array.isArray(data) ? data : [])).catch(() => {});
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">THREAT ANALYZER</h1>
        <p className="text-sm text-gray-500 mt-1">Paste suspicious messages for instant AI analysis</p>
      </div>

      {/* INPUT */}
      <div className="brutalist-card p-5">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1">SUSPICIOUS MESSAGE</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="brutalist-input w-full min-h-[120px] resize-y"
              placeholder="Paste email, SMS, or message content..."
              required
              maxLength={5000}
            />
            <div className="text-[10px] font-bold text-gray-400 mt-1 text-right">{input.length}/5000</div>
          </div>
          <button type="submit" className="brutalist-btn" disabled={loading || !input.trim()}>
            {loading ? "ANALYZING..." : "ANALYZE THREAT"}
          </button>
        </form>
      </div>

      {/* RESULT */}
      {analysis && (
        <div className="brutalist-card p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider">ANALYSIS RESULT</h2>
            <button onClick={() => setAnalysis(null)} className="text-[10px] font-bold uppercase hover:underline">CLEAR</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider">THREAT LEVEL:</span>
              <span className={`border-[2px] border-black px-2 py-0.5 text-[10px] font-bold uppercase ${
                analysis.threat_level === "high" ? "bg-[#FF3B3B] text-white" :
                analysis.threat_level === "medium" ? "bg-[#FBBF24]" :
                analysis.threat_level === "low" ? "bg-[#22C55E]" :
                "bg-[#E8E4DA]"
              }`}>{analysis.threat_level}</span>
              <span className="text-xs font-bold">({Math.round(analysis.threat_score * 100)}%)</span>
            </div>
            {analysis.flagged_phrases && analysis.flagged_phrases.length > 0 && (
              <div className="border-[2px] border-black p-3 bg-[#FFFBF0]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">FLAGGED PHRASES</div>
                <div className="flex flex-wrap gap-1">
                  {analysis.flagged_phrases.map((p: string) => (
                    <span key={p} className="border-[2px] border-black px-2 py-0.5 text-[10px] font-bold bg-[#FF3B3B] text-white">{p}</span>
                  ))}
                </div>
              </div>
            )}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="border-[2px] border-black p-3 bg-[#FFFBF0]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">RECOMMENDATIONS</div>
                <ul className="space-y-1">
                  {analysis.recommendations.map((r: string) => (
                    <li key={r} className="text-xs flex gap-2"><span className="shrink-0">-</span><span>{r}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY */}
      <div className="brutalist-card p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4">ANALYSIS HISTORY</h2>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No analyses yet. Paste a suspicious message above.</div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="border-[2px] border-black p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`border-[2px] border-black px-2 py-0.5 text-[10px] font-bold uppercase ${
                      h.threat_level === "high" ? "bg-[#FF3B3B] text-white" :
                      h.threat_level === "medium" ? "bg-[#FBBF24]" :
                      "bg-[#22C55E]"
                    }`}>{h.threat_level}</span>
                    <span className="text-xs font-bold">{Math.round(h.threat_score * 100)}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{new Date(h.analyzed_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{h.input_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

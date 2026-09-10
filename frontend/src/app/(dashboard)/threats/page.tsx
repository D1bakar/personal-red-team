"use client";

import { useState } from "react";
import { useAIThreatDetection } from "@/hooks/useAIThreatDetection";

export default function ThreatsPage() {
  const [input, setInput] = useState("");
  const [serverResult, setServerResult] = useState<any>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const { analyze, isAnalyzing, result: clientResult, error: clientError } = useAIThreatDetection();

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    analyze(input);
    const token = localStorage.getItem("token");
    if (token) {
      setServerLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/v1/threats/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ input_text: input }),
        });
        if (res.ok) setServerResult(await res.json());
      } catch (err) { console.error(err); } finally { setServerLoading(false); }
    }
  };

  const borderLeft = (level: string) => {
    if (level === "danger") return "border-l-[#FF3B3B]";
    if (level === "caution") return "border-l-[#FBBF24]";
    return "border-l-[#22C55E]";
  };

  const badge = (level: string) => {
    if (level === "danger") return "bg-[#FF3B3B] text-white border-[#FF3B3B]";
    if (level === "caution") return "bg-[#FBBF24] border-[#FBBF24]";
    return "bg-[#22C55E] border-[#22C55E]";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">THREAT DETECTION</h1>
        <p className="text-sm text-gray-500 mt-1">Analyze messages for social engineering</p>
      </div>

      {/* INPUT */}
      <div className="brutalist-card p-6">
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">SUSPICIOUS MESSAGE</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="brutalist-input resize-none mb-3" placeholder="Paste a suspicious message here..." />
        <button onClick={handleAnalyze} disabled={isAnalyzing || serverLoading || !input.trim()} className="brutalist-btn !text-xs">
          {isAnalyzing || serverLoading ? "ANALYZING..." : "ANALYZE MESSAGE"}
        </button>
      </div>

      {clientError && (
        <div className="brutalist-card p-4 border-l-[8px] border-l-[#FF3B3B]">
          <div className="text-xs font-bold uppercase text-[#FF3B3B]">ERROR: {clientError}</div>
        </div>
      )}

      {/* CLIENT RESULT */}
      {clientResult && (
        <div className={`brutalist-card p-6 border-l-[8px] ${borderLeft(clientResult.threatLevel)} animate-brutalist-in`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-black uppercase tracking-wider">CLIENT-SIDE ANALYSIS</h3>
              <p className="text-xs text-gray-500">Detected locally in browser</p>
            </div>
            <span className={`brutalist-badge ${badge(clientResult.threatLevel)}`}>{clientResult.threatLevel.toUpperCase()}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            <div className="border-[2px] border-black p-3">
              <div className="text-[10px] font-bold uppercase text-gray-500">SENTIMENT</div>
              <div className="font-bold text-sm">{clientResult.sentiment.label} ({(clientResult.sentiment.score * 100).toFixed(0)}%)</div>
            </div>
            <div className="border-[2px] border-black p-3">
              <div className="text-[10px] font-bold uppercase text-gray-500">URGENCY</div>
              <div className="font-bold text-sm">{clientResult.urgencyScore}</div>
            </div>
            <div className="border-[2px] border-black p-3">
              <div className="text-[10px] font-bold uppercase text-gray-500">FEAR</div>
              <div className="font-bold text-sm">{clientResult.fearScore}</div>
            </div>
          </div>
          {clientResult.triggers.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2">DETECTED TRIGGERS</div>
              <div className="flex flex-wrap gap-2">
                {clientResult.triggers.map((t: string) => (
                  <span key={t} className="brutalist-badge bg-black text-[#FFFBF0] border-black">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SERVER RESULT */}
      {serverResult && (
        <div className={`brutalist-card p-6 border-l-[8px] ${borderLeft(serverResult.threat_level)} animate-brutalist-in`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-black uppercase tracking-wider">SERVER-SIDE ANALYSIS</h3>
              <p className="text-xs text-gray-500">Deep Python NLP analysis</p>
            </div>
            <span className={`brutalist-badge ${badge(serverResult.threat_level)}`}>{serverResult.threat_level.toUpperCase()}</span>
          </div>
          <div className="border-[2px] border-black p-3 mb-4">
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">ANALYSIS</div>
            <p className="text-sm leading-relaxed">{serverResult.explanation}</p>
          </div>
          {serverResult.triggers.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2">DETECTED TRIGGERS</div>
              <div className="flex flex-wrap gap-2">
                {serverResult.triggers.map((t: string) => (
                  <span key={t} className="brutalist-badge bg-black text-[#FFFBF0] border-black">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXAMPLES */}
      <div className="brutalist-card p-6">
        <div className="text-xs font-bold uppercase tracking-wider mb-3">EXAMPLES TO TEST</div>
        <div className="space-y-2">
          {[
            "URGENT: Your bank account has been compromised! Call 1-800-555-0199 immediately to secure your funds.",
            "Hey! It has been a while. I am in trouble and need your help. Can you send me $500 through Venmo?",
            "IRS NOTICE: You owe $12,500 in back taxes. A warrant will be issued unless you pay immediately via gift cards.",
            "Congratulations! You have won a $1,000,000 lottery prize! Click here to claim before it expires.",
          ].map((ex, i) => (
            <button key={i} onClick={() => setInput(ex)} className="w-full text-left border-[2px] border-black p-3 text-xs hover:bg-black hover:text-[#FFFBF0] transition-colors duration-150 leading-relaxed">
              &quot;{ex}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

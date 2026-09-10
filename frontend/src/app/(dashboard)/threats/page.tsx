"use client";

import { useState } from "react";
import { Brain, Search, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { useAIThreatDetection } from "@/hooks/useAIThreatDetection";

export default function ThreatsPage() {
  const [inputText, setInputText] = useState("");
  const [serverResult, setServerResult] = useState<any>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const { analyze, isAnalyzing, result: clientResult, error: clientError } = useAIThreatDetection();

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    analyze(inputText);

    const token = localStorage.getItem("token");
    if (token) {
      setServerLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/v1/threats/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ input_text: inputText }),
        });
        if (res.ok) setServerResult(await res.json());
      } catch (err) {
        console.error("Server analysis failed:", err);
      } finally {
        setServerLoading(false);
      }
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-danger-400" />;
      case "caution":
        return <AlertTriangle className="h-6 w-6 text-warning-400" />;
      default:
        return <Shield className="h-6 w-6 text-success-400" />;
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "danger":
        return "border-danger-500/30 bg-danger-500/10";
      case "caution":
        return "border-warning-500/30 bg-warning-500/10";
      default:
        return "border-success-500/30 bg-success-500/10";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Threat Detection</h1>
        <p className="text-surface-400">Analyze messages for social engineering tactics</p>
      </div>

      <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
        <label className="mb-2 block text-sm font-medium text-surface-300">
          Paste a suspicious message below:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 text-white placeholder-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
          placeholder="e.g., URGENT: Your account has been suspended! Click here to verify your identity immediately or face permanent closure..."
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || serverLoading || !inputText.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <Search className={`h-4 w-4 ${isAnalyzing || serverLoading ? "animate-pulse" : ""}`} />
          {isAnalyzing || serverLoading ? "Analyzing..." : "Analyze Message"}
        </button>
      </div>

      {clientError && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 p-4">
          <p className="text-danger-400">Client analysis error: {clientError}</p>
        </div>
      )}

      {clientResult && (
        <div className={`rounded-xl border ${getThreatColor(clientResult.threatLevel)} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            {getThreatIcon(clientResult.threatLevel)}
            <div>
              <h3 className="text-lg font-semibold text-white">
                Client-Side Analysis
              </h3>
              <p className="text-sm text-surface-400">Detected locally in your browser</p>
            </div>
            <div className="ml-auto">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                clientResult.threatLevel === "danger"
                  ? "bg-danger-500/20 text-danger-400"
                  : clientResult.threatLevel === "caution"
                  ? "bg-warning-500/20 text-warning-400"
                  : "bg-success-500/20 text-success-400"
              }`}>
                {clientResult.threatLevel.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="rounded-lg bg-surface-800/50 p-3">
              <p className="text-xs text-surface-400">Sentiment</p>
              <p className="font-medium text-white">
                {clientResult.sentiment.label} ({(clientResult.sentiment.score * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="rounded-lg bg-surface-800/50 p-3">
              <p className="text-xs text-surface-400">Urgency Score</p>
              <p className="font-medium text-white">{clientResult.urgencyScore}</p>
            </div>
            <div className="rounded-lg bg-surface-800/50 p-3">
              <p className="text-xs text-surface-400">Fear Score</p>
              <p className="font-medium text-white">{clientResult.fearScore}</p>
            </div>
          </div>

          {clientResult.triggers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-surface-300 mb-2">Detected Triggers:</p>
              <div className="flex flex-wrap gap-2">
                {clientResult.triggers.map((trigger: string) => (
                  <span
                    key={trigger}
                    className="rounded-full bg-surface-800 px-3 py-1 text-sm text-surface-300"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {serverResult && (
        <div className={`rounded-xl border ${getThreatColor(serverResult.threat_level)} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            {getThreatIcon(serverResult.threat_level)}
            <div>
              <h3 className="text-lg font-semibold text-white">
                Server-Side Analysis
              </h3>
              <p className="text-sm text-surface-400">Deep analysis via Python NLP engine</p>
            </div>
            <div className="ml-auto">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                serverResult.threat_level === "danger"
                  ? "bg-danger-500/20 text-danger-400"
                  : serverResult.threat_level === "caution"
                  ? "bg-warning-500/20 text-warning-400"
                  : "bg-success-500/20 text-success-400"
              }`}>
                {serverResult.threat_level.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-surface-400">Threat Score: {(serverResult.threat_score * 100).toFixed(1)}%</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-surface-300 mb-2">Analysis:</p>
            <p className="text-surface-300">{serverResult.explanation}</p>
          </div>

          {serverResult.triggers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-surface-300 mb-2">Detected Triggers:</p>
              <div className="flex flex-wrap gap-2">
                {serverResult.triggers.map((trigger: string) => (
                  <span
                    key={trigger}
                    className="rounded-full bg-surface-800 px-3 py-1 text-sm text-surface-300"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Example Messages to Test</h3>
        <div className="space-y-2">
          {[
            "URGENT: Your bank account has been compromised! Call 1-800-555-0199 immediately to secure your funds.",
            "Hey! It's been a while. I'm in trouble and need your help. Can you send me $500 through Venmo? I'll pay you back next week.",
            "IRS NOTICE: You owe $12,500 in back taxes. A warrant will be issued for your arrest unless you pay immediately via gift cards.",
            "Congratulations! You've won a $1,000,000 lottery prize! Click here to claim your reward before it expires.",
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => setInputText(example)}
              className="w-full rounded-lg border border-surface-700 p-3 text-left text-sm text-surface-300 hover:bg-surface-800 transition-colors"
            >
              &quot;{example}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

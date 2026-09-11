"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Score {
  overall: number;
  simulation_success_rate: number;
  detection_accuracy: number;
  learning_completion: number;
  recency: number;
}

interface Vulnerabilities {
  urgency: number;
  fear: number;
  authority: number;
  greed: number;
  curiosity: number;
  secrecy: number;
}

const vulnLabels: Record<string, string> = {
  urgency: "Urgency-based scams",
  fear: "Fear manipulation",
  authority: "Authority impersonation",
  greed: "Greed / financial bait",
  curiosity: "Curiosity exploitation",
  secrecy: "Secrecy requests",
};

export default function AnalyticsPage() {
  const [score, setScore] = useState<Score | null>(null);
  const [vulns, setVulns] = useState<Vulnerabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      api.getScore().catch(() => null),
      api.getVulnerabilities().catch(() => null),
    ]).then(([s, v]) => {
      setScore(s);
      setVulns(v);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="brutalist-tag animate-pulse">LOADING...</div></div>;

  const vulnColor = (v: number) => {
    if (v >= 0.7) return "bg-[#FF3B3B]";
    if (v >= 0.4) return "bg-[#FBBF24]";
    return "bg-[#22C55E]";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">ANALYTICS</h1>
        <p className="text-sm text-gray-500 mt-1">Your security posture and vulnerabilities</p>
      </div>

      {score && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Score */}
          <div className="brutalist-card p-6 animate-fade-up opacity-0">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">SECURITY POSTURE</div>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <svg className="h-44 w-44 -rotate-90">
                  <circle cx="80" cy="80" r="72" stroke="#E8E4DA" strokeWidth="10" fill="none" />
                  <circle cx="80" cy="80" r="72" stroke="black" strokeWidth="10" fill="none" strokeDasharray={`${score.overall * 4.52} 452`} strokeLinecap="square" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{score.overall}</span>
                  <span className="text-xs font-bold uppercase text-gray-500">/100</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Simulation Defense", value: score.simulation_success_rate },
                { label: "Detection Accuracy", value: score.detection_accuracy },
                { label: "Learning Progress", value: score.learning_completion },
                { label: "Activity Recency", value: score.recency },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="uppercase tracking-wider">{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-3 border-[2px] border-black bg-[#E8E4DA]">
                    <div className="h-full bg-black transition-all duration-700" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerabilities */}
          <div className="brutalist-card p-6 animate-fade-up stagger-2 opacity-0">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">VULNERABILITY PROFILE</div>
            <p className="text-xs text-gray-400 mb-6">Susceptibility to each attack type</p>
            {vulns && (
              <div className="space-y-4">
                {Object.entries(vulns).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="uppercase tracking-wider">{vulnLabels[key] || key}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <div className="h-3 border-[2px] border-black bg-[#E8E4DA]">
                      <div className={`h-full transition-all duration-700 ${vulnColor(value)}`} style={{ width: `${value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      <div className="brutalist-card p-6 animate-fade-up stagger-3 opacity-0">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">RECOMMENDATIONS</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Keep Training", desc: "Run more simulations to build resilience.", color: "bg-[#3B82F6]" },
            { title: "Analyze Real Messages", desc: "Check suspicious messages you receive.", color: "bg-[#22C55E]" },
            { title: "Focus on Weaknesses", desc: "Pay attention to your highest vulnerability areas.", color: "bg-[#FBBF24]" },
            { title: "Stay Informed", desc: "Follow cybersecurity news for new tactics.", color: "bg-[#A855F7]" },
          ].map((rec) => (
            <div key={rec.title} className="border-[2px] border-black p-4">
              <div className={`inline-flex h-6 w-6 items-center justify-center border-[2px] border-black ${rec.color} text-[10px] font-black mb-2`}>--&gt;</div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-1">{rec.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

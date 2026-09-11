"use client";

import { useEffect, useState } from "react";
import { Compass, Lightbulb, MailOpen, RefreshCcw, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, ProgressBar, ScoreRing, Skeleton } from "@/components/ui";

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
  greed: "Greed & financial bait",
  curiosity: "Curiosity exploitation",
  secrecy: "Secrecy requests",
};

const recommendations = [
  { icon: RefreshCcw, title: "Keep training", desc: "Regular drills compound into instinct.", tint: "bg-teal-50 text-teal-700" },
  { icon: MailOpen, title: "Analyze real messages", desc: "Run anything suspicious through the analyzer.", tint: "bg-sky-50 text-sky-700" },
  { icon: Compass, title: "Shore up weaknesses", desc: "Focus drills on your highest-risk patterns.", tint: "bg-amber-50 text-amber-700" },
  { icon: TrendingUp, title: "Watch the trend", desc: "A rising score means the training is working.", tint: "bg-violet-50 text-violet-700" },
];

export default function AnalyticsPage() {
  const [score, setScore] = useState<Score | null>(null);
  const [vulns, setVulns] = useState<Vulnerabilities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getScore().catch(() => null), api.getVulnerabilities().catch(() => null)])
      .then(([s, v]) => {
        setScore(s);
        setVulns(v);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" subtitle="Your security posture at a glance." />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Your security posture at a glance." />

      {score && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Score */}
          <div className="card p-7 animate-fade-up">
            <p className="eyebrow">Security posture</p>
            <div className="my-6 flex justify-center">
              <ScoreRing value={score.overall} />
            </div>
            <div className="space-y-4">
              {[
                { label: "Simulation defense", value: score.simulation_success_rate },
                { label: "Detection accuracy", value: score.detection_accuracy },
                { label: "Learning progress", value: score.learning_completion },
                { label: "Activity recency", value: score.recency },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="font-medium text-ink-700">{item.label}</span>
                    <span className="font-mono font-semibold">{item.value}%</span>
                  </div>
                  <ProgressBar value={item.value} />
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerabilities */}
          <div className="card p-7 animate-fade-up stagger-2">
            <p className="eyebrow">Vulnerability profile</p>
            <p className="subtle mb-6 mt-1 !text-[13px]">
              Where you&apos;re still most susceptible — lower is better.
            </p>
            {vulns ? (
              <div className="space-y-4">
                {Object.entries(vulns).map(([key, value]) => {
                  const pct = Math.round(value * 100);
                  const tone = value >= 0.7 ? "rose" : value >= 0.4 ? "amber" : "emerald";
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex justify-between text-[13px]">
                        <span className="font-medium text-ink-700">{vulnLabels[key] || key}</span>
                        <span className="font-mono font-semibold">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} tone={tone} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="subtle">Not enough data yet — run a few drills first.</p>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card p-7 animate-fade-up stagger-3">
        <p className="eyebrow mb-1 flex items-center gap-1.5">
          <Lightbulb size={13} /> Recommended next steps
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recommendations.map((rec) => (
            <div key={rec.title} className="panel p-4 transition-colors hover:bg-white">
              <span className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${rec.tint}`}>
                <rec.icon size={17} strokeWidth={2} />
              </span>
              <h3 className="text-sm font-semibold tracking-tight">{rec.title}</h3>
              <p className="subtle mt-0.5 !text-[13px]">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

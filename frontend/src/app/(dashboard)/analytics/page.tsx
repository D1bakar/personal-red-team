"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

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

export default function AnalyticsPage() {
  const [score, setScore] = useState<Score | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerabilities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [scoreRes, vulnRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/analytics/score", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/v1/analytics/vulnerabilities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (scoreRes.ok) setScore(await scoreRes.json());
        if (vulnRes.ok) setVulnerabilities(await vulnRes.json());
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-400">Loading analytics...</div>
      </div>
    );
  }

  const getVulnerabilityLabel = (key: string) => {
    const labels: Record<string, string> = {
      urgency: "Urgency-based scams",
      fear: "Fear-based manipulation",
      authority: "Authority impersonation",
      greed: "Greed/financial bait",
      curiosity: "Curiosity exploitation",
      secrecy: "Secrecy requests",
    };
    return labels[key] || key;
  };

  const getVulnerabilityColor = (value: number) => {
    if (value >= 0.7) return "bg-danger-500";
    if (value >= 0.4) return "bg-warning-500";
    return "bg-success-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-surface-400">Your security posture and vulnerability profile</p>
      </div>

      {score && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">Security Posture Score</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <svg className="h-48 w-48 -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-surface-800"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${score.overall * 5.28} 528`}
                    className="text-primary-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white">{score.overall}</span>
                  <span className="text-sm text-surface-400">out of 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Simulation Defense</span>
                  <span className="text-white">{score.simulation_success_rate}%</span>
                </div>
                <div className="h-3 rounded-full bg-surface-800">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${score.simulation_success_rate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Detection Accuracy</span>
                  <span className="text-white">{score.detection_accuracy}%</span>
                </div>
                <div className="h-3 rounded-full bg-surface-800">
                  <div
                    className="h-full rounded-full bg-success-500 transition-all"
                    style={{ width: `${score.detection_accuracy}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Learning Progress</span>
                  <span className="text-white">{score.learning_completion}%</span>
                </div>
                <div className="h-3 rounded-full bg-surface-800">
                  <div
                    className="h-full rounded-full bg-warning-500 transition-all"
                    style={{ width: `${score.learning_completion}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-400">Activity Recency</span>
                  <span className="text-white">{score.recency}%</span>
                </div>
                <div className="h-3 rounded-full bg-surface-800">
                  <div
                    className="h-full rounded-full bg-surface-400 transition-all"
                    style={{ width: `${score.recency}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">Vulnerability Profile</h2>
            <p className="mb-6 text-sm text-surface-400">
              How susceptible you are to each type of social engineering attack
            </p>

            {vulnerabilities && (
              <div className="space-y-4">
                {Object.entries(vulnerabilities).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-300">{getVulnerabilityLabel(key)}</span>
                      <span className="text-white">{Math.round(value * 100)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-800">
                      <div
                        className={`h-full rounded-full transition-all ${getVulnerabilityColor(value)}`}
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Recommendations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-surface-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary-400" />
              <h3 className="font-medium text-white">Keep Training</h3>
            </div>
            <p className="text-sm text-surface-400">
              Run more simulations to improve your ability to identify social engineering tactics.
            </p>
          </div>
          <div className="rounded-lg bg-surface-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-success-400" />
              <h3 className="font-medium text-white">Analyze Real Messages</h3>
            </div>
            <p className="text-sm text-surface-400">
              Use the threat detector to check suspicious messages you receive in real life.
            </p>
          </div>
          <div className="rounded-lg bg-surface-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning-400" />
              <h3 className="font-medium text-white">Focus on Weaknesses</h3>
            </div>
            <p className="text-sm text-surface-400">
              Pay special attention to your highest vulnerability categories shown above.
            </p>
          </div>
          <div className="rounded-lg bg-surface-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-danger-400" />
              <h3 className="font-medium text-white">Stay Informed</h3>
            </div>
            <p className="text-sm text-surface-400">
              Follow cybersecurity news to learn about new social engineering tactics being used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

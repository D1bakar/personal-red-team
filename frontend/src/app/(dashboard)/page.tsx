"use client";

import { useEffect, useState } from "react";
import { Shield, Brain, Target, Activity, TrendingUp, AlertTriangle } from "lucide-react";

interface Stats {
  total_simulations: number;
  interacted_simulations: number;
  total_analyses: number;
  threats_detected: number;
}

interface Score {
  overall: number;
  simulation_success_rate: number;
  detection_accuracy: number;
  learning_completion: number;
  recency: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [statsRes, scoreRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/analytics/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/v1/analytics/score", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (scoreRes.ok) setScore(await scoreRes.json());
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-surface-400">Welcome to your security command center</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-500/10 p-2">
              <Target className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Simulations</p>
              <p className="text-2xl font-bold text-white">{stats?.total_simulations || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success-500/10 p-2">
              <Shield className="h-5 w-5 text-success-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Simulations Ignored</p>
              <p className="text-2xl font-bold text-white">{stats?.interacted_simulations || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning-500/10 p-2">
              <Brain className="h-5 w-5 text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Threats Analyzed</p>
              <p className="text-2xl font-bold text-white">{stats?.total_analyses || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-danger-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-danger-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Threats Detected</p>
              <p className="text-2xl font-bold text-white">{stats?.threats_detected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {score && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Security Posture Score</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="h-32 w-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-surface-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${score.overall * 3.52} 352`}
                    className="text-primary-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{score.overall}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Simulation Defense</span>
                    <span className="text-white">{score.simulation_success_rate}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${score.simulation_success_rate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Detection Accuracy</span>
                    <span className="text-white">{score.detection_accuracy}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-success-500"
                      style={{ width: `${score.detection_accuracy}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Learning Progress</span>
                    <span className="text-white">{score.learning_completion}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface-800">
                    <div
                      className="h-full rounded-full bg-warning-500"
                      style={{ width: `${score.learning_completion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/simulations"
                className="flex items-center gap-3 rounded-lg border border-surface-700 p-4 hover:bg-surface-800 transition-colors"
              >
                <Target className="h-5 w-5 text-danger-400" />
                <div>
                  <p className="font-medium text-white">Run New Simulation</p>
                  <p className="text-sm text-surface-400">Test your defenses with a simulated attack</p>
                </div>
              </a>
              <a
                href="/threats"
                className="flex items-center gap-3 rounded-lg border border-surface-700 p-4 hover:bg-surface-800 transition-colors"
              >
                <Brain className="h-5 w-5 text-warning-400" />
                <div>
                  <p className="font-medium text-white">Analyze a Message</p>
                  <p className="text-sm text-surface-400">Check if a message is a social engineering attempt</p>
                </div>
              </a>
              <a
                href="/analytics"
                className="flex items-center gap-3 rounded-lg border border-surface-700 p-4 hover:bg-surface-800 transition-colors"
              >
                <Activity className="h-5 w-5 text-success-400" />
                <div>
                  <p className="font-medium text-white">View Analytics</p>
                  <p className="text-sm text-surface-400">See your vulnerability profile and trends</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

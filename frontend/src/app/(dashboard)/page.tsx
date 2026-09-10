"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) return;
    if (userData) setUser(JSON.parse(userData));

    Promise.all([
      fetch("http://localhost:8000/api/v1/analytics/stats", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:8000/api/v1/analytics/score", { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([s, sc]) => {
      if (s.ok) setStats(await s.json());
      if (sc.ok) setScore(await sc.json());
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="brutalist-tag animate-pulse">LOADING...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <h1 className="text-3xl font-black uppercase tracking-tight">DASHBOARD</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back{user ? `, ${user.name}` : ""}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Score */}
        <div className={`brutalist-card p-6 lg:row-span-2 animate-fade-up stagger-1 opacity-0`}>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">SECURITY SCORE</div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="h-40 w-40 -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="#E8E4DA" strokeWidth="8" fill="none" />
                <circle cx="72" cy="72" r="64" stroke="black" strokeWidth="8" fill="none" strokeDasharray={`${(score?.overall || 0) * 4.02} 402`} strokeLinecap="square" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black">{score?.overall || 0}</span>
                <span className="text-xs font-bold uppercase text-gray-500">/100</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Simulation Defense", value: score?.simulation_success_rate || 0 },
              { label: "Detection Accuracy", value: score?.detection_accuracy || 0 },
              { label: "Learning Progress", value: score?.learning_completion || 0 },
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

        {/* Stat cards */}
        {[
          { label: "Total Simulations", value: stats?.total_simulations || 0, letter: "S", link: "/simulations" },
          { label: "Ignored (Safe)", value: stats?.interacted_simulations || 0, letter: "I", link: "/simulations" },
          { label: "Threats Analyzed", value: stats?.total_analyses || 0, letter: "T", link: "/threats" },
          { label: "Threats Detected", value: stats?.threats_detected || 0, letter: "D", link: "/threats" },
        ].map((stat, i) => (
          <Link key={stat.label} href={stat.link} className={`brutalist-card p-5 animate-fade-up stagger-${i + 2} opacity-0 block`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.label}</div>
                <div className="text-4xl font-black">{stat.value}</div>
              </div>
              <div className="h-8 w-8 flex items-center justify-center border-[2px] border-black bg-[#E8E4DA] text-xs font-black shrink-0">{stat.letter}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`grid gap-4 sm:grid-cols-3 animate-fade-up stagger-5 opacity-0`}>
        {[
          { title: "Run Simulation", desc: "Test your defenses", href: "/simulations", color: "bg-[#FF3B3B]" },
          { title: "Analyze Threat", desc: "Check a message", href: "/threats", color: "bg-[#FBBF24]" },
          { title: "View Analytics", desc: "See your profile", href: "/analytics", color: "bg-[#22C55E]" },
        ].map((a) => (
          <Link key={a.title} href={a.href} className="brutalist-card p-5 group">
            <div className={`inline-flex h-8 w-8 items-center justify-center border-[2px] border-black ${a.color} text-xs font-black mb-3`}>--&gt;</div>
            <h3 className="font-bold uppercase tracking-wider text-sm mb-1 group-hover:underline">{a.title}</h3>
            <p className="text-xs text-gray-500">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

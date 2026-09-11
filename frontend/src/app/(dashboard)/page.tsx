"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentSims, setRecentSims] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    Promise.all([
      api.getMe().catch(() => null),
      api.getStats().catch(() => null),
      api.listSimulations().catch(() => []),
    ]).then(([u, s, sims]) => {
      if (!u) {
        window.location.href = "/login";
        return;
      }
      setStats(s);
      setRecentSims(Array.isArray(sims) ? sims.slice(0, 3) : []);
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">DASHBOARD</h1>
          <p className="text-sm text-gray-500 mt-1">Your security command center</p>
        </div>
        <a href="/simulations" className="brutalist-btn shrink-0">NEW SIMULATION</a>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "SIMULATIONS", value: stats?.total_simulations || 0, color: "bg-[#FF3B3B]" },
          { label: "ANALYSES", value: stats?.total_analyses || 0, color: "bg-[#3B82F6]" },
          { label: "DETECTION RATE", value: `${stats?.detection_rate || 0}%`, color: "bg-[#22C55E]" },
        ].map((s, i) => (
          <div key={s.label} className={`brutalist-card p-5 animate-fade-up stagger-${i + 1} opacity-0`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-3 w-3 border-[2px] border-black ${s.color}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-3xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      {/* RECENT */}
      <div className="brutalist-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider">RECENT SIMULATIONS</h2>
          <a href="/simulations" className="text-xs font-bold uppercase tracking-wider hover:underline">VIEW ALL</a>
        </div>
        {recentSims.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No simulations yet. Run your first attack.</div>
        ) : (
          <div className="space-y-2">
            {recentSims.map((sim) => (
              <div key={sim.id} className="flex items-center justify-between border-[2px] border-black p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{sim.scenario_name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{sim.type.replace(/_/g, " ")}</div>
                </div>
                <div className={`shrink-0 border-[2px] border-black px-2 py-0.5 text-[10px] font-bold uppercase ${sim.is_revealed ? "bg-[#22C55E]" : "bg-[#FBBF24]"}`}>
                  {sim.is_revealed ? "REVEALED" : "ACTIVE"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "SIMULATIONS", href: "/simulations", desc: "Run attack simulations", color: "bg-[#FF3B3B]" },
          { label: "THREAT ANALYZER", href: "/threats", desc: "Analyze suspicious messages", color: "bg-[#FBBF24]" },
          { label: "ANALYTICS", href: "/analytics", desc: "View your security score", color: "bg-[#22C55E]" },
        ].map((a, i) => (
          <a key={a.label} href={a.href} className={`brutalist-card p-4 hover:-translate-y-0.5 transition-all animate-fade-up stagger-${i + 1} opacity-0`}>
            <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center border-[2px] border-black text-xs font-black ${a.color}`}>
              {a.label[0]}
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider">{a.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

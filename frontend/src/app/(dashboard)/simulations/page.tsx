"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [revealData, setRevealData] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const data = await api.listSimulations();
      setSimulations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const sim = await api.generateSimulation();
      setSimulations((prev) => [sim, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (id: string) => {
    setRevealId(id);
    try {
      const data = await api.revealSimulation(id);
      setRevealData(data);
      loadSimulations();
    } catch (err) {
      console.error(err);
    } finally {
      setRevealId(null);
    }
  };

  const filtered = simulations.filter((s) => filter === "all" || s.type === filter);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">SIMULATIONS</h1>
          <p className="text-sm text-gray-500 mt-1">Train against social engineering attacks</p>
        </div>
        <button onClick={handleGenerate} className="brutalist-btn shrink-0" disabled={loading}>
          {loading ? "GENERATING..." : "GENERATE ATTACK"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "ALL" },
          { value: "phishing_email", label: "EMAIL" },
          { value: "sms_smishing", label: "SMS" },
          { value: "authority_scam", label: "AUTHORITY" },
          { value: "urgency_fear", label: "URGENCY" },
          { value: "curiosity_bait", label: "CURIOSITY" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`border-[2px] border-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === f.value ? "bg-black text-[#FFFBF0]" : "bg-white hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">NO SIMULATIONS FOUND</div>
          <button onClick={handleGenerate} className="brutalist-btn">GENERATE YOUR FIRST ATTACK</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sim) => (
            <div key={sim.id} className="brutalist-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="border-[2px] border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#3B82F6] text-white shrink-0">
                      {sim.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-gray-500 shrink-0">LVL {sim.difficulty_level}</span>
                  </div>
                  <h3 className="font-bold text-sm mt-2">{sim.scenario_name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{sim.scenario_text}</p>
                </div>
                <div className="shrink-0">
                  {sim.is_revealed ? (
                    <button
                      onClick={() => setRevealData({ triggers: sim.psychological_triggers, tips: sim.defense_tips, level: sim.threat_level, explanation: sim.explanation })}
                      className="brutalist-btn-outline !text-[10px] !py-1 !px-2"
                    >
                      VIEW
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReveal(sim.id)}
                      disabled={revealId === sim.id}
                      className="brutalist-btn !text-[10px] !py-1 !px-2"
                    >
                      {revealId === sim.id ? "..." : "REVEAL"}
                    </button>
                  )}
                </div>
              </div>

              {/* REVEAL PANEL */}
              {revealData && (
                <div className="mt-4 border-t-[3px] border-black pt-4 space-y-3">
                  <div className="border-[2px] border-black p-3 bg-[#FFFBF0]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">THREAT LEVEL</div>
                    <div className="font-bold text-sm uppercase">{revealData.level}</div>
                  </div>
                  <div className="border-[2px] border-black p-3 bg-[#FFFBF0]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">EXPLANATION</div>
                    <div className="text-xs leading-relaxed">{revealData.explanation}</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border-[2px] border-black p-3 bg-[#FFFBF0]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">PSYCHOLOGICAL TRIGGERS</div>
                      <div className="flex flex-wrap gap-1">
                        {(revealData.triggers || revealData.psychological_triggers || []).map((t: string) => (
                          <span key={t} className="border-[2px] border-black px-2 py-0.5 text-[10px] font-bold bg-[#FF3B3B] text-white">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="border-[2px] border-black p-3 bg-[#FFFBF0]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">DEFENSE TIPS</div>
                      <ul className="space-y-1">
                        {(revealData.tips || revealData.defense_tips || []).map((tip: string) => (
                          <li key={tip} className="text-xs flex gap-2"><span className="shrink-0">-</span><span>{tip}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button onClick={() => setRevealData(null)} className="text-xs font-bold uppercase tracking-wider hover:underline">CLOSE</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

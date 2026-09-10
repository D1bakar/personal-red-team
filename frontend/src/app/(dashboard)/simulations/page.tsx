"use client";

import { useEffect, useState } from "react";

interface Simulation {
  id: string;
  type: string;
  scenario_name: string;
  psychological_triggers: string[];
  status: string;
  content: string;
  delivered_at: string | null;
  interacted_at: string | null;
  created_at: string;
}

interface Reveal {
  simulation_id: string;
  psychological_triggers: string[];
  explanation: string;
  defense_tips: string[];
  difficulty_rating: number;
}

const typeLabels: Record<string, string> = {
  phishing_email: "PHISHING EMAIL",
  smishing: "SMS SMISHING",
  authority_scam: "AUTHORITY SCAM",
  urgency_fear: "URGENCY / FEAR",
  curiosity_bait: "CURIOSITY BAIT",
  greed_prize: "GREED / PRIZE",
  secrecy_request: "SECRECY REQUEST",
  tech_support: "TECH SUPPORT",
  romance_social: "ROMANCE / SOCIAL",
};

const typeColors: Record<string, string> = {
  phishing_email: "bg-[#FF3B3B]",
  smishing: "bg-[#F97316]",
  authority_scam: "bg-[#A855F7]",
  urgency_fear: "bg-[#EF4444]",
  curiosity_bait: "bg-[#3B82F6]",
  greed_prize: "bg-[#FBBF24]",
  secrecy_request: "bg-[#6366F1]",
  tech_support: "bg-[#14B8A6]",
  romance_social: "bg-[#EC4899]",
};

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revealSim, setRevealSim] = useState<Simulation | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSims();
  }, []);

  const fetchSims = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/simulations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSimulations(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setGenerating(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/simulations/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const sim = await res.json();
        setSimulations([sim, ...simulations]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const showReveal = async (sim: Simulation) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setRevealSim(sim);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/simulations/${sim.id}/reveal`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReveal(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="brutalist-tag animate-pulse">LOADING...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">SIMULATIONS</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">Practice identifying attacks</p>
        </div>
        <button onClick={generate} disabled={generating} className="brutalist-btn text-xs">
          {generating ? "GENERATING..." : "+ NEW SIMULATION"}
        </button>
      </div>

      {/* REVEAL PANEL */}
      {revealSim && reveal && (
        <div className="brutalist-card p-6 border-l-[8px] border-l-[#FF3B3B] animate-brutalist-in">
          <div className="flex items-center justify-between mb-4">
            <div className="brutalist-tag bg-[#FF3B3B] text-white border-[#FF3B3B]">REVEAL</div>
            <button onClick={() => { setRevealSim(null); setReveal(null); }} className="brutalist-btn-outline text-xs py-1 px-2">CLOSE</button>
          </div>

          <div className="border-[3px] border-black bg-sand p-4 mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">THE ATTACK</div>
            <p className="font-mono text-sm">{revealSim.content}</p>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider mb-2">TRIGGERS USED</div>
            <div className="flex flex-wrap gap-2">
              {reveal.psychological_triggers.map((t) => (
                <span key={t} className="brutalist-badge bg-[#FF3B3B] text-white border-[#FF3B3B]">{t}</span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider mb-2">ANALYSIS</div>
            <p className="font-mono text-sm text-gray-600">{reveal.explanation}</p>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider mb-2">DEFENSE TIPS</div>
            <ul className="space-y-2">
              {reveal.defense_tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-mono">
                  <span className="mt-1 h-2 w-2 bg-black shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            DIFFICULTY:
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`h-3 w-3 border-[2px] border-black ${i < reveal.difficulty_rating ? "bg-black" : "bg-sand"}`} />
            ))}
          </div>
        </div>
      )}

      {/* SIMULATION LIST */}
      {simulations.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <div className="text-4xl mb-4">◎</div>
          <h3 className="text-lg font-black uppercase mb-2">NO SIMULATIONS YET</h3>
          <p className="text-sm text-gray-500 font-mono mb-4">Generate your first simulation to start training.</p>
          <button onClick={generate} className="brutalist-btn text-xs">GENERATE FIRST SIMULATION</button>
        </div>
      ) : (
        <div className="space-y-3">
          {simulations.map((sim, i) => (
            <div
              key={sim.id}
              className={`brutalist-card p-4 animate-fade-up opacity-0 stagger-${Math.min(i + 1, 6)} ${mounted ? "" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-10 w-10 flex items-center justify-center border-[2px] border-black ${typeColors[sim.type] || "bg-sand"} text-xs font-black`}>
                  {sim.type.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold uppercase tracking-wider text-sm truncate">{sim.scenario_name}</h3>
                    <span className="brutalist-tag text-[10px] shrink-0">{typeLabels[sim.type] || sim.type}</span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 line-clamp-1 mb-2">{sim.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {sim.psychological_triggers.map((t) => (
                      <span key={t} className="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase">{t}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => showReveal(sim)} className="brutalist-btn-outline text-[10px] py-1 px-2 shrink-0">
                  REVEAL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

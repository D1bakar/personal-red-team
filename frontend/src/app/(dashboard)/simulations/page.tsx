"use client";

import { useEffect, useState } from "react";
import { Target, RefreshCw, Eye, CheckCircle, XCircle } from "lucide-react";

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

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);

  const fetchSimulations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/simulations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSimulations(await res.json());
    } catch (err) {
      console.error("Failed to fetch simulations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const generateSimulation = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setGenerating(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/simulations/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const newSim = await res.json();
        setSimulations([newSim, ...simulations]);
      }
    } catch (err) {
      console.error("Failed to generate simulation:", err);
    } finally {
      setGenerating(false);
    }
  };

  const viewReveal = async (sim: Simulation) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSelectedSim(sim);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/simulations/${sim.id}/reveal`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReveal(await res.json());
    } catch (err) {
      console.error("Failed to get reveal:", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Target className="h-4 w-4 text-warning-400" />;
      case "interacted":
        return <XCircle className="h-4 w-4 text-danger-400" />;
      case "ignored":
        return <CheckCircle className="h-4 w-4 text-success-400" />;
      default:
        return <Target className="h-4 w-4 text-surface-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-400">Loading simulations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Simulations</h1>
          <p className="text-surface-400">Practice identifying social engineering attacks</p>
        </div>
        <button
          onClick={generateSimulation}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Generating..." : "New Simulation"}
        </button>
      </div>

      {selectedSim && reveal && (
        <div className="rounded-xl border border-primary-500/30 bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Simulation Reveal</h2>
            <button
              onClick={() => {
                setSelectedSim(null);
                setReveal(null);
              }}
              className="text-surface-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mb-4 rounded-lg bg-surface-800 p-4">
            <p className="text-sm text-surface-400 mb-2">The Attack:</p>
            <p className="text-white">{selectedSim.content}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-warning-400 mb-2">
              Psychological Triggers Used:
            </p>
            <div className="flex flex-wrap gap-2">
              {reveal.psychological_triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="rounded-full bg-warning-500/10 px-3 py-1 text-sm text-warning-400 border border-warning-500/20"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-primary-400 mb-2">Analysis:</p>
            <p className="text-surface-300">{reveal.explanation}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-success-400 mb-2">Defense Tips:</p>
            <ul className="space-y-1">
              {reveal.defense_tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-surface-400">
            <span>Difficulty:</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i < reveal.difficulty_rating ? "bg-primary-500" : "bg-surface-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {simulations.length === 0 ? (
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-surface-600" />
          <h3 className="mt-4 text-lg font-medium text-white">No simulations yet</h3>
          <p className="mt-2 text-surface-400">
            Generate your first simulation to start training your defenses.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="rounded-xl border border-surface-800 bg-surface-900 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(sim.status)}
                  <div>
                    <h3 className="font-medium text-white">{sim.scenario_name}</h3>
                    <p className="text-sm text-surface-400">{getTypeLabel(sim.type)}</p>
                    <p className="mt-2 text-sm text-surface-300 line-clamp-2">{sim.content}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sim.psychological_triggers.map((trigger) => (
                        <span
                          key={trigger}
                          className="rounded bg-surface-800 px-2 py-0.5 text-xs text-surface-400"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => viewReveal(sim)}
                  className="flex items-center gap-1 rounded-lg border border-surface-700 px-3 py-1.5 text-sm text-surface-300 hover:bg-surface-800 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Reveal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

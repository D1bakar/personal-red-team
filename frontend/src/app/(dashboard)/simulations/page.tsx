"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2, Plus, ShieldQuestion, Swords, X } from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, PageHeader, SegmentedControl, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const filters = [
  { value: "all", label: "All" },
  { value: "phishing_email", label: "Email" },
  { value: "sms_smishing", label: "SMS" },
  { value: "authority_scam", label: "Authority" },
  { value: "urgency_fear", label: "Urgency" },
  { value: "curiosity_bait", label: "Curiosity" },
] as const;

type Filter = (typeof filters)[number]["value"];

function prettyType(t: string) {
  return (t || "simulation").replace(/_/g, " ");
}

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [revealData, setRevealData] = useState<any>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const data = await api.listSimulations();
      setSimulations(Array.isArray(data) ? data : []);
    } catch {
      /* keep quiet, show empty state */
    } finally {
      setFetching(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const sim = await api.generateSimulation();
      setSimulations((prev) => [sim, ...prev]);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (id: string) => {
    setRevealId(id);
    try {
      const data = await api.revealSimulation(id);
      setRevealData({ ...data, simulation_id: id });
      loadSimulations();
    } catch {
      /* noop */
    } finally {
      setRevealId(null);
    }
  };

  const showStoredReveal = (sim: any) => {
    setRevealData({
      simulation_id: sim.id,
      psychological_triggers: sim.psychological_triggers,
      explanation: sim.explanation,
      defense_tips: sim.defense_tips,
      threat_level: sim.threat_level,
      difficulty_rating: sim.difficulty_level,
    });
    document.getElementById("reveal-panel")?.scrollIntoView({ behavior: "smooth" });
  };

  const filtered = simulations.filter((s) => filter === "all" || s.type === filter);
  const triggers: string[] = revealData?.triggers || revealData?.psychological_triggers || [];
  const tips: string[] = revealData?.tips || revealData?.defense_tips || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulations"
        subtitle="Safe drills that teach you how attacks really feel."
        action={
          <button onClick={handleGenerate} className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {loading ? "Crafting attack…" : "New drill"}
          </button>
        }
      />

      {/* Reveal panel */}
      {revealData && (
        <div id="reveal-panel" className="card overflow-hidden animate-pop">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold tracking-tight">Attack anatomy</h2>
            <button onClick={() => setRevealData(null)} className="btn-ghost !p-2" aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="panel p-4">
              <p className="label">Threat level</p>
              <p className="text-sm font-semibold capitalize">
                {revealData.level || revealData.threat_level || "Unknown"}
              </p>
            </div>
            <div className="panel p-4">
              <p className="label">Difficulty</p>
              <p className="text-sm font-semibold">
                {revealData.difficulty_rating ?? revealData.level ?? "—"}
              </p>
            </div>
            <div className="panel p-4 sm:col-span-2">
              <p className="label">What just happened</p>
              <p className="text-sm leading-relaxed text-ink-700">{revealData.explanation}</p>
            </div>
            <div className="panel p-4">
              <p className="label">Psychological triggers</p>
              <div className="flex flex-wrap gap-1.5">
                {triggers.length === 0 && <span className="text-sm text-ink-400">None listed</span>}
                {triggers.map((t: string) => (
                  <span key={t} className="badge-rose">{t}</span>
                ))}
              </div>
            </div>
            <div className="panel p-4">
              <p className="label">How to defend</p>
              <ul className="space-y-1.5">
                {tips.map((tip: string) => (
                  <li key={tip} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <SegmentedControl options={[...filters]} value={filter} onChange={setFilter} />

      {fetching ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldQuestion}
          title="No drills here yet"
          hint="Generate your first attack simulation and learn to spot it before it spots you."
          action={
            <button onClick={handleGenerate} className="btn-primary" disabled={loading}>
              {loading ? "Crafting attack…" : "Generate your first drill"}
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((sim, i) => {
            const revealed = sim.is_revealed ?? sim.status === "revealed";
            return (
              <div
                key={sim.id}
                className={cn("card card-hover p-5 animate-fade-up", `stagger-${Math.min(i + 1, 6)}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="badge-blue capitalize">{prettyType(sim.type)}</span>
                      {sim.difficulty_level != null && (
                        <span className="badge-slate">Level {sim.difficulty_level}</span>
                      )}
                      <span className={cn(revealed ? "badge-emerald" : "badge-amber")}>
                        {revealed ? "Reviewed" : "Active"}
                      </span>
                    </div>
                    <h3 className="font-semibold tracking-tight">{sim.scenario_name}</h3>
                    {sim.scenario_text && (
                      <p className="subtle mt-1 line-clamp-2 !text-[13px]">{sim.scenario_text}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {revealed ? (
                      <button onClick={() => showStoredReveal(sim)} className="btn-secondary !px-3.5 !py-1.5 !text-xs">
                        <Eye size={13} /> Review
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReveal(sim.id)}
                        disabled={revealId === sim.id}
                        className="btn-primary !px-3.5 !py-1.5 !text-xs"
                      >
                        {revealId === sim.id ? <Loader2 size={13} className="animate-spin" /> : <Swords size={13} />}
                        {revealId === sim.id ? "Revealing" : "Reveal"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

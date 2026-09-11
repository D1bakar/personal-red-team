"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ScanSearch,
  ShieldCheck,
  Swords,
  Target,
} from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, PageHeader, Skeleton, StatCard } from "@/components/ui";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    label: "Run a simulation",
    desc: "Face a safe, realistic attack",
    href: "/simulations",
    icon: Swords,
    tint: "bg-teal-50 text-teal-700",
  },
  {
    label: "Analyze a threat",
    desc: "Check a suspicious message",
    href: "/threats",
    icon: ScanSearch,
    tint: "bg-sky-50 text-sky-700",
  },
  {
    label: "Review analytics",
    desc: "See your security score",
    href: "/analytics",
    icon: BarChart3,
    tint: "bg-violet-50 text-violet-700",
  },
];

function prettyType(t: string) {
  return (t || "simulation").replace(/_/g, " ");
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentSims, setRecentSims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good to see you"
        subtitle="Your security command center — calm, current, under control."
        action={
          <Link href="/simulations" className="btn-primary">
            <Swords size={15} />
            New simulation
          </Link>
        }
      />

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[118px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Simulations" value={stats?.total_simulations ?? 0} icon={Swords} tone="teal" index={0} />
          <StatCard label="Analyses" value={stats?.total_analyses ?? 0} icon={Activity} tone="blue" index={1} />
          <StatCard label="Detection rate" value={`${stats?.detection_rate ?? 0}%`} icon={Target} tone="emerald" index={2} />
        </div>
      )}

      {/* Recent */}
      <div className="card p-6 animate-fade-up stagger-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Recent simulations</h2>
          <Link
            href="/simulations"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-teal-700 hover:text-teal-600"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        {recentSims.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No simulations yet"
            hint="Run your first drill — it takes under a minute and teaches a lasting lesson."
            action={
              <Link href="/simulations" className="btn-primary">
                Start your first drill
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {recentSims.map((sim) => {
              const revealed = sim.is_revealed ?? sim.status === "revealed";
              return (
                <div
                  key={sim.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 transition-colors hover:border-slate-300"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{sim.scenario_name}</div>
                    <div className="mt-0.5 text-xs capitalize text-ink-400">
                      {prettyType(sim.type)}
                    </div>
                  </div>
                  <span className={cn(revealed ? "badge-emerald" : "badge-amber")}>
                    {revealed ? "Reviewed" : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((a, i) => (
          <Link
            key={a.label}
            href={a.href}
            className={cn("card card-hover group p-5 animate-fade-up", `stagger-${i + 3}`)}
          >
            <span className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", a.tint)}>
              <a.icon size={19} strokeWidth={2} />
            </span>
            <div className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight">
              {a.label}
              <ArrowRight size={15} className="text-ink-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
            <p className="subtle mt-1 !text-[13px]">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

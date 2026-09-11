"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";

const stats = [
  { value: "9", label: "Attack types simulated" },
  { value: "10k+", label: "Simulations run" },
  { value: "50k+", label: "Threats analyzed" },
  { value: "1k+", label: "People training" },
];

const pillars = [
  {
    icon: Swords,
    title: "Simulate",
    desc: "Safe, controlled phishing drills across email, SMS, and chat. Exposure in a safe space builds real immunity.",
    tint: "bg-teal-50 text-teal-700",
  },
  {
    icon: ScanSearch,
    title: "Detect",
    desc: "Paste any suspicious message and get an instant read — urgency cues, authority plays, manipulation patterns.",
    tint: "bg-sky-50 text-sky-700",
  },
  {
    icon: BarChart3,
    title: "Improve",
    desc: "Your security posture score tracks progress over time and shows exactly where you're still vulnerable.",
    tint: "bg-violet-50 text-violet-700",
  },
];

const attacks = [
  "Phishing emails",
  "SMS smishing",
  "Authority scams",
  "Urgency & fear",
  "Curiosity bait",
  "Prize & greed",
  "Secrecy requests",
  "Tech support",
  "Social & romance",
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-mist text-ink-900">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-cyan-600 text-white shadow-glow">
              <ShieldCheck size={19} strokeWidth={2.2} />
            </span>
            <span className="font-semibold tracking-tight">Personal Red Team</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost !px-4">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary !py-2">
              Get started
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-36">
        <div className="ambient" aria-hidden>
          <div className="orb left-[-140px] top-[-140px] h-[480px] w-[480px] bg-teal-200/50 animate-float-slow" />
          <div className="orb right-[-160px] top-[10%] h-[520px] w-[520px] bg-cyan-200/40 animate-float-slower" />
          <div className="orb bottom-[-200px] left-1/3 h-[380px] w-[380px] bg-sky-100/70" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className={`max-w-2xl transition-all duration-700 ${mounted ? "animate-fade-up" : "opacity-0"}`}
          >
            <span className="badge-teal mb-5">
              <Sparkles size={12} />
              AI-powered defense training
            </span>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Train your <span className="text-gradient">human firewall</span>
            </h1>
            <p className="subtle mt-5 max-w-xl text-base sm:text-lg">
              Most breaches start with a message, not malware. Personal Red Team builds your
              psychological resilience with realistic simulations and instant threat analysis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary !px-7 !py-3 !text-[15px]">
                Start training free
                <ArrowRight size={16} />
              </Link>
              <a href="#how" className="btn-secondary !px-7 !py-3 !text-[15px]">
                How it works
              </a>
            </div>
          </div>

          {/* Stats */}
          <div
            className={`card mt-12 grid grid-cols-2 gap-2 p-3 transition-all sm:grid-cols-4 ${mounted ? "animate-fade-up stagger-2" : "opacity-0"}`}
          >
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl px-4 py-5 text-center transition-colors hover:bg-slate-50">
                <div className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                  {s.value}
                </div>
                <div className="label !mb-0 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="how" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow mb-3">Methodology</p>
            <h2 className="h-display text-3xl sm:text-4xl">Three steps to resilience</h2>
            <p className="subtle mt-3">
              A calm, repeatable loop: face a safe attack, learn its anatomy, watch your score rise.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.title} className={`card card-hover p-7 animate-fade-up stagger-${i + 1}`}>
                <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${p.tint}`}>
                  <p.icon size={22} strokeWidth={2} />
                </span>
                <div className="mb-1 font-mono text-xs text-ink-400">0{i + 1}</div>
                <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="subtle mt-2">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attack coverage */}
      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-card bg-ink-900 p-8 text-white shadow-soft-lg sm:p-12">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-300">
                Coverage
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Attacks we simulate
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Nine families of social-engineering tactics, tuned to your level as you improve.
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {attacks.map((a) => (
              <div
                key={a}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium transition-colors duration-200 hover:border-teal-400/40 hover:bg-white/10"
              >
                <Radar size={15} className="shrink-0 text-teal-300" />
                {a}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-2xl animate-fade-up">
          <span className="badge-teal mb-5">Free to start</span>
          <h2 className="h-display text-3xl sm:text-4xl">Ready when the next scam arrives?</h2>
          <p className="subtle mx-auto mt-3 max-w-md">
            Two minutes to set up. A lifetime of sharper instincts.
          </p>
          <Link href="/register" className="btn-primary mx-auto mt-8 !px-8 !py-3 !text-[15px]">
            Create your account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-700 to-cyan-600 text-white">
              <ShieldCheck size={15} />
            </span>
            Personal Red Team
          </div>
          <p className="text-xs text-ink-400">Train calmly. Stay sharp.</p>
        </div>
      </footer>
    </div>
  );
}

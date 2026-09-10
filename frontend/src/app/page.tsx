"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="fixed top-0 z-50 w-full border-b-[3px] border-black bg-cream">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border-[3px] border-black bg-black text-cream text-xs font-black">
              PRT
            </div>
            <span className="font-bold text-sm uppercase tracking-wider hidden sm:block">Personal Red Team</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="brutalist-btn-outline text-xs py-1.5 px-3">
              Sign In
            </Link>
            <Link href="/register" className="brutalist-btn text-xs py-1.5 px-3">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="brutalist-tag mb-6 inline-flex">AI-POWERED DEFENSE</div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-6">
              YOUR
              <br />
              <span className="inline-block border-[3px] border-black bg-[#FF3B3B] px-3 py-1 mt-1">HUMAN</span>
              <br />
              FIREWALL
            </h1>

            <p className="max-w-lg text-lg text-gray-600 mb-8 font-mono">
              The human psyche is the most critical vulnerability in cybersecurity. We build your psychological resilience through AI-driven simulations.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="brutalist-btn">
                Start Training →
              </Link>
              <a href="#features" className="brutalist-btn-outline">
                How It Works
              </a>
            </div>
          </div>

          {/* STATS BAR */}
          <div className={`mt-16 border-[3px] border-black bg-white p-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Attack Types", value: "9" },
                { label: "Simulations Run", value: "10K+" },
                { label: "Threats Caught", value: "50K+" },
                { label: "Users Protected", value: "1K+" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 px-4 border-t-[3px] border-black">
        <div className="mx-auto max-w-6xl">
          <div className={`mb-12 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="brutalist-tag mb-4 inline-flex">METHODOLOGY</div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">THREE PILLARS</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "SIMULATION",
                desc: "Safe, controlled phishing attacks via email, SMS, and notifications. Inoculate yourself against real threats.",
                color: "bg-[#FF3B3B]",
              },
              {
                num: "02",
                title: "DETECTION",
                desc: "Real-time AI analysis of incoming messages. Detects urgency, authority impersonation, and manipulation.",
                color: "bg-[#FBBF24]",
              },
              {
                num: "03",
                title: "ANALYTICS",
                desc: "Track your Security Posture Score. Visualize vulnerability patterns and learn from each encounter.",
                color: "bg-[#22C55E]",
              },
            ].map((feature, i) => (
              <div
                key={feature.num}
                className={`brutalist-card p-6 animate-fade-up stagger-${i + 1} opacity-0 ${mounted ? "" : ""}`}
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center border-[3px] border-black ${feature.color} text-sm font-black`}>
                  {feature.num}
                </div>
                <h3 className="text-xl font-black uppercase tracking-wider mb-2">{feature.title}</h3>
                <p className="text-sm font-mono text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATTACK TYPES */}
      <section className="py-16 px-4 bg-black text-cream border-t-[3px] border-black">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <div className="inline-flex items-center border-[2px] border-cream px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-cream mb-4">ARSENAL</div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">WE SIMULATE</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Phishing Emails", icon: "✉" },
              { name: "SMS Smishing", icon: "💬" },
              { name: "Authority Scams", icon: "👔" },
              { name: "Urgency & Fear", icon: "⏰" },
              { name: "Curiosity Bait", icon: "🔍" },
              { name: "Greed & Prizes", icon: "💰" },
              { name: "Secrecy Requests", icon: "🤫" },
              { name: "Tech Support", icon: "🖥" },
              { name: "Romance & Social", icon: "🎭" },
            ].map((attack) => (
              <div
                key={attack.name}
                className="flex items-center gap-3 border-[3px] border-cream/30 p-4 hover:border-cream transition-colors duration-200"
              >
                <span className="text-2xl">{attack.icon}</span>
                <span className="font-bold uppercase tracking-wider text-sm">{attack.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t-[3px] border-black">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-4">READY TO DEFEND?</h2>
          <p className="text-gray-600 font-mono mb-8">Start training your defenses against social engineering today.</p>
          <Link href="/register" className="brutalist-btn text-lg px-8 py-3">
            CREATE ACCOUNT →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-black py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-sm uppercase tracking-wider">PRT — Personal Red Team</div>
          <div className="text-xs text-gray-500 font-mono">AI-Powered Social Engineering Defense</div>
        </div>
      </footer>
    </div>
  );
}

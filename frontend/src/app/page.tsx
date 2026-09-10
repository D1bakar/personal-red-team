import Link from "next/link";
import { Shield, Brain, Target, Activity, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold">Personal Red Team</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-surface-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/20 to-transparent" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm text-primary-400">
            <Zap className="h-4 w-4" />
            AI-Powered Social Engineering Defense
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">
            Your Personal
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Human Firewall
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-surface-400">
            The most critical vulnerability in cybersecurity is the human psyche.
            Personal Red Team builds your psychological resilience through
            AI-driven simulations and real-time threat detection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="group flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-lg font-semibold hover:bg-primary-700 transition-colors">
              Start Training
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Three Pillars of Defense</h2>
            <p className="mx-auto max-w-2xl text-surface-400">
              Our approach combines ethical hacking simulations, real-time AI detection, and comprehensive analytics.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-danger-500/20 bg-danger-500/10 p-8 transition-all hover:scale-105">
              <Target className="mb-4 h-12 w-12 text-danger-400" />
              <h3 className="mb-3 text-xl font-semibold">Simulation Engine</h3>
              <p className="text-surface-400">Periodic, safe simulated attacks via email, SMS, and notifications to build your resilience.</p>
            </div>
            <div className="rounded-xl border border-warning-500/20 bg-warning-500/10 p-8 transition-all hover:scale-105">
              <Brain className="mb-4 h-12 w-12 text-warning-400" />
              <h3 className="mb-3 text-xl font-semibold">AI Threat Detection</h3>
              <p className="text-surface-400">Real-time analysis detecting urgency, authority impersonation, and manipulation tactics.</p>
            </div>
            <div className="rounded-xl border border-success-500/20 bg-success-500/10 p-8 transition-all hover:scale-105">
              <Activity className="mb-4 h-12 w-12 text-success-400" />
              <h3 className="mb-3 text-xl font-semibold">Threat Dashboard</h3>
              <p className="text-surface-400">Track your Security Posture Score and visualize vulnerability patterns.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

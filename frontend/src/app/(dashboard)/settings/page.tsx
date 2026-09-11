"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, LogOut, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [frequency, setFrequency] = useState(24);
  const [difficulty, setDifficulty] = useState(3);
  const [saved, setSaved] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    api
      .getMe()
      .then((u) => {
        setUser(u);
        setMfaEnabled(!!u.mfa_enabled);
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    api.clearTokens();
    window.location.href = "/login";
  };

  const handleSetup2fa = async () => {
    setMfaError("");
    setMfaLoading(true);
    try {
      const data = await api.setup2fa();
      setQrCode(data.qr_code);
      setMfaSecret(data.secret);
    } catch (err: any) {
      setMfaError(err.message || "Setup failed");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnable2fa = async () => {
    setMfaError("");
    setMfaLoading(true);
    try {
      await api.enable2fa(mfaCode.trim());
      setMfaEnabled(true);
      setQrCode(null);
      setMfaSecret("");
      setMfaCode("");
      const u = await api.getMe().catch(() => null);
      if (u) setUser(u);
    } catch (err: any) {
      setMfaError(err.message || "Invalid code");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisable2fa = async () => {
    setMfaError("");
    setMfaLoading(true);
    try {
      await api.disable2fa(mfaCode.trim());
      setMfaEnabled(false);
      setMfaCode("");
      const u = await api.getMe().catch(() => null);
      if (u) setUser(u);
    } catch (err: any) {
      setMfaError(err.message || "Invalid code");
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Tune training to your pace — and lock down your account."
        action={
          <button onClick={handleSave} className="btn-primary">
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile */}
        <div className="card p-6 animate-fade-up">
          <h2 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
            <UserRound size={16} className="text-ink-400" /> Profile
          </h2>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-700 to-cyan-600 text-lg font-semibold text-white">
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-ink-500">{user.email}</div>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="font-medium text-ink-700">Security score</span>
                  <span className="font-mono font-semibold">{user.security_score ?? 0}</span>
                </div>
                <ProgressBar value={user.security_score ?? 0} />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user.is_verified ? (
                  <span className="badge-emerald">Email verified</span>
                ) : (
                  <span className="badge-amber">Email unverified</span>
                )}
                {mfaEnabled ? (
                  <span className="badge-teal">2FA on</span>
                ) : (
                  <span className="badge-slate">2FA off</span>
                )}
              </div>
            </div>
          ) : (
            <p className="subtle">Loading profile…</p>
          )}
        </div>

        {/* Training preferences */}
        <div className="card p-6 animate-fade-up stagger-1">
          <h2 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
            <SlidersHorizontal size={16} className="text-ink-400" /> Training pace
          </h2>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="font-medium text-ink-700">Drill frequency</span>
                <span className="font-mono text-ink-500">every {frequency}h</span>
              </div>
              <input
                type="range"
                min={6}
                max={168}
                step={6}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-[11px] text-ink-400">
                <span>Often</span>
                <span>Relaxed</span>
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="font-medium text-ink-700">Difficulty</span>
                <span className="font-mono text-ink-500">level {difficulty}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={cn(
                      "h-10 flex-1 rounded-xl text-sm font-semibold transition-all duration-200",
                      level <= difficulty
                        ? "bg-ink-900 text-white shadow-sm"
                        : "bg-slate-100 text-ink-400 hover:bg-slate-200"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div className="card p-6 animate-fade-up stagger-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold tracking-tight">
              <ShieldCheck size={16} className="text-ink-400" /> Two-factor auth
            </h2>
            <span className={mfaEnabled ? "badge-emerald" : "badge-slate"}>
              {mfaEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {mfaError && <div className="alert-error mb-3">{mfaError}</div>}

          {!mfaEnabled && !qrCode && (
            <div className="space-y-3">
              <p className="subtle !text-[13px]">
                Add an authenticator app as a second step at sign-in. Takes a minute.
              </p>
              <button onClick={handleSetup2fa} className="btn-secondary w-full" disabled={mfaLoading}>
                {mfaLoading && <Loader2 size={15} className="animate-spin" />}
                {mfaLoading ? "Preparing…" : "Set up 2FA"}
              </button>
            </div>
          )}

          {!mfaEnabled && qrCode && (
            <div className="space-y-3">
              <p className="subtle !text-[13px]">Scan with your app, then enter the code to confirm.</p>
              <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                <img src={qrCode} alt="2FA QR code" className="h-44 w-44 rounded-lg" />
              </div>
              {mfaSecret && (
                <div className="panel p-3">
                  <p className="label">Manual key</p>
                  <p className="break-all font-mono text-xs">{mfaSecret}</p>
                </div>
              )}
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="input text-center font-mono text-xl font-semibold tracking-[0.35em]"
                placeholder="••••••"
                inputMode="numeric"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setQrCode(null);
                    setMfaSecret("");
                    setMfaCode("");
                    setMfaError("");
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button onClick={handleEnable2fa} className="btn-primary flex-1" disabled={mfaLoading}>
                  {mfaLoading ? "Verifying…" : "Confirm"}
                </button>
              </div>
            </div>
          )}

          {mfaEnabled && (
            <div className="space-y-3">
              <p className="subtle !text-[13px]">Enter a code from your app to turn 2FA off.</p>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="input text-center font-mono text-xl font-semibold tracking-[0.35em]"
                placeholder="••••••"
                inputMode="numeric"
              />
              <button onClick={handleDisable2fa} className="btn-danger w-full" disabled={mfaLoading}>
                {mfaLoading ? "Turning off…" : "Turn off 2FA"}
              </button>
            </div>
          )}
        </div>

        {/* Session */}
        <div className="card p-6 animate-fade-up stagger-3">
          <h2 className="mb-4 flex items-center gap-2 font-semibold tracking-tight">
            <Bell size={16} className="text-ink-400" /> Session
          </h2>
          <div className="space-y-2.5">
            <div className="panel flex items-center justify-between p-3.5">
              <span className="text-sm font-medium">Status</span>
              <span className="badge-emerald">Active</span>
            </div>
            <div className="panel flex items-center justify-between p-3.5">
              <span className="text-sm font-medium">Session length</span>
              <span className="font-mono text-sm text-ink-500">30 min</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary w-full !text-rose-600 hover:!bg-rose-50">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

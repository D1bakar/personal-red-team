"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { AuthFooter, AuthLink, AuthShell } from "@/components/auth";

export default function Verify2faPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [noToken, setNoToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("mfa_pending_token")) {
      setNoToken(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pendingToken = sessionStorage.getItem("mfa_pending_token");
    if (!pendingToken) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      await api.verify2faLogin(pendingToken, code.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Two-step verification" subtitle="Enter the code from your authenticator app">
      {noToken ? (
        <div className="space-y-4 text-center">
          <div className="alert-error">No pending sign-in found.</div>
          <AuthLink href="/login">Back to sign in</AuthLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="alert-error">{error}</div>}

          <div className="flex justify-center">
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <span className="absolute inset-0 rounded-2xl bg-teal-400/40 animate-pulse-ring" />
              <ShieldCheck size={26} />
            </span>
          </div>

          <div>
            <label className="label text-center" htmlFor="code">6-digit code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="input text-center font-mono text-2xl font-semibold tracking-[0.4em]"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}

      <AuthFooter>
        <span />
        <AuthLink href="/login">Back to sign in</AuthLink>
      </AuthFooter>
    </AuthShell>
  );
}

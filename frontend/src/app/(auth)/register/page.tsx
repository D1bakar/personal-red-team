"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { AuthFooter, AuthLink, AuthShell } from "@/components/auth";

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const failed = rules.find((r) => !r.test(password));
    if (failed) {
      setError(`Password requirement not met: ${failed.label.toLowerCase()}`);
      return;
    }

    setLoading(true);
    try {
      await api.register(email, name, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start building your human firewall">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <div>
          <label className="label" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Alex Morgan"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
            minLength={8}
          />
          {password.length > 0 && (
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {rules.map((r) => {
                const pass = r.test(password);
                return (
                  <li
                    key={r.label}
                    className={`flex items-center gap-1.5 text-xs ${pass ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    <Check size={12} strokeWidth={3} className={pass ? "" : "opacity-30"} />
                    {r.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <AuthFooter>
        <span className="text-ink-400">Already have an account?</span>
        <AuthLink href="/login">Sign in</AuthLink>
      </AuthFooter>
    </AuthShell>
  );
}

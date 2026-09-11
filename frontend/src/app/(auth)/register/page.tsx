"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter");
      return;
    }

    if (!/\d/.test(password)) {
      setError("Password must contain a digit");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain a special character");
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
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-black text-[#FFFBF0] text-xs font-black">PRT</div>
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight">CREATE ACCOUNT</h1>
          <p className="text-sm text-gray-500 mt-2">Start your security training</p>
        </div>

        <div className="brutalist-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border-[3px] border-[#FF3B3B] bg-[#FF3B3B]/10 p-3 text-sm font-bold uppercase">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="brutalist-input w-full"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutalist-input w-full"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="brutalist-input w-full"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="brutalist-input w-full"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="brutalist-btn w-full" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-xs font-bold uppercase tracking-wider hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

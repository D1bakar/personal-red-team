"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
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
          <h1 className="text-3xl font-black uppercase tracking-tight">SIGN IN</h1>
          <p className="text-sm text-gray-500 mt-2">Access your security dashboard</p>
        </div>

        <div className="brutalist-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border-[3px] border-[#FF3B3B] bg-[#FF3B3B]/10 p-3 text-sm font-bold uppercase">
                {error}
              </div>
            )}

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
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="brutalist-btn w-full" disabled={loading}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-xs font-bold uppercase tracking-wider hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

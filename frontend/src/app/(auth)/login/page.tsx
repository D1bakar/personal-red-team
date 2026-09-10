"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brutalist-card p-8 animate-brutalist-in">
      <h2 className="text-2xl font-black uppercase tracking-wider mb-1">WELCOME BACK</h2>
      <p className="text-sm text-gray-500 font-mono mb-6">Sign in to your account</p>

      {error && (
        <div className="border-[3px] border-black bg-[#FF3B3B] p-3 mb-4 text-sm font-bold uppercase">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="brutalist-input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="brutalist-input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className="brutalist-btn w-full">
          {loading ? "SIGNING IN..." : "SIGN IN →"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        No account?{" "}
        <Link href="/register" className="font-bold text-black underline decoration-[3px] decoration-black underline-offset-4 hover:bg-black hover:text-cream px-1 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}

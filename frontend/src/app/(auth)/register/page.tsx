"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brutalist-card p-8 animate-brutalist-in">
      <h2 className="text-2xl font-black uppercase tracking-wider mb-1">CREATE ACCOUNT</h2>
      <p className="text-sm text-gray-500 mb-6">Join the defense force</p>

      {error && (
        <div className="border-[3px] border-black bg-[#FF3B3B] p-3 mb-4 text-sm font-bold uppercase">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="brutalist-input" placeholder="John Doe" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="brutalist-input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="brutalist-input" placeholder="min 8 characters" />
        </div>
        <button type="submit" disabled={loading} className="brutalist-btn w-full">
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-black underline decoration-[3px] decoration-black underline-offset-4 hover:bg-black hover:text-[#FFFBF0] px-1 transition-colors">Sign in</Link>
      </p>
    </div>
  );
}

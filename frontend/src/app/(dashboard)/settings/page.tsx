"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [frequency, setFrequency] = useState(24);
  const [difficulty, setDifficulty] = useState(3);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">SETTINGS</h1>
        <p className="text-sm text-gray-500 font-mono mt-1">Configure your experience</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className={`brutalist-card p-6 animate-fade-up opacity-0 ${mounted ? "" : ""}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">PROFILE</div>
          {user && (
            <div className="space-y-3">
              <div className="border-[2px] border-black p-3">
                <div className="text-[10px] font-bold uppercase text-gray-500">NAME</div>
                <div className="font-bold">{user.name}</div>
              </div>
              <div className="border-[2px] border-black p-3">
                <div className="text-[10px] font-bold uppercase text-gray-500">EMAIL</div>
                <div className="font-bold">{user.email}</div>
              </div>
              <div className="border-[2px] border-black p-3">
                <div className="text-[10px] font-bold uppercase text-gray-500">SECURITY SCORE</div>
                <div className="font-black text-2xl">{user.security_score}</div>
              </div>
            </div>
          )}
        </div>

        {/* Simulation Settings */}
        <div className={`brutalist-card p-6 animate-fade-up stagger-2 opacity-0 ${mounted ? "" : ""}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">SIMULATION CONFIG</div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="uppercase tracking-wider">FREQUENCY</span>
                <span>EVERY {frequency}H</span>
              </div>
              <input
                type="range" min="6" max="168" step="6" value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-black"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                <span>6H</span><span>1 WEEK</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="uppercase tracking-wider">DIFFICULTY</span>
                <span>LEVEL {difficulty}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 h-10 border-[3px] border-black font-black text-sm transition-all duration-150 ${
                      level <= difficulty ? "bg-black text-cream" : "bg-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className={`brutalist-card p-6 animate-fade-up stagger-3 opacity-0 ${mounted ? "" : ""}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">PRIVACY</div>
          <div className="space-y-3">
            {[
              { label: "Local AI Processing", desc: "Analyze in browser", enabled: true },
              { label: "Cloud Analysis", desc: "Enhanced detection", enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-[2px] border-black p-3">
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{item.desc}</div>
                </div>
                <div className={`h-6 w-12 border-[2px] border-black relative cursor-pointer ${item.enabled ? "bg-[#22C55E]" : "bg-sand"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 border-[2px] border-black transition-all duration-200 ${item.enabled ? "left-5 bg-black" : "left-0.5 bg-white"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="brutalist-btn">
        {saved ? "SAVED ✓" : "SAVE SETTINGS"}
      </button>
    </div>
  );
}

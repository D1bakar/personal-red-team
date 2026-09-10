"use client";

import { useEffect, useState } from "react";
import { Settings, User, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [frequency, setFrequency] = useState(24);
  const [difficulty, setDifficulty] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
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
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-surface-400">Configure your Personal Red Team experience</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          {user && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-surface-400">Name</label>
                <p className="text-white">{user.name}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-surface-400">Email</label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-surface-400">Security Score</label>
                <p className="text-primary-400 font-bold">{user.security_score}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-warning-400" />
            <h2 className="text-lg font-semibold text-white">Simulation Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-surface-300">
                Simulation Frequency: Every {frequency} hours
              </label>
              <input
                type="range"
                min="6"
                max="168"
                step="6"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-surface-500">
                <span>6h</span>
                <span>1 week</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-surface-300">
                Difficulty Level: {difficulty}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-surface-500">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-success-400" />
            <h2 className="text-lg font-semibold text-white">Privacy</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Local AI Processing</p>
                <p className="text-sm text-surface-400">Analyze threats in your browser</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-success-500 relative">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Cloud Analysis</p>
                <p className="text-sm text-surface-400">Enhanced detection via server</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-success-500 relative">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 transition-colors"
      >
        {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}

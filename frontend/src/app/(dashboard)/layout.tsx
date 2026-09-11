"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanSearch,
  Settings,
  ShieldCheck,
  Swords,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const nav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Simulations", href: "/simulations", icon: Swords },
  { name: "Threat analyzer", href: "/threats", icon: ScanSearch },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-glow"
                : "text-ink-500 hover:bg-slate-100 hover:text-ink-900"
            )}
          >
            <item.icon size={17} strokeWidth={2.1} className="shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const handleLogout = () => {
    api.clearTokens();
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-mist">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/60 bg-white/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="mb-7 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-cyan-600 text-white shadow-glow">
            <ShieldCheck size={19} strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Personal Red Team</span>
        </Link>

        <nav className="flex-1">
          <NavLinks pathname={pathname} />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/60 bg-white/70 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-700 to-cyan-600 text-white">
            <ShieldCheck size={16} />
          </span>
          <span className="text-sm font-semibold">Personal Red Team</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-secondary !p-2.5"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-64 flex-col bg-white/95 px-4 py-5 shadow-soft-lg backdrop-blur-xl animate-fade-in">
            <div className="mb-7 flex items-center gap-2.5 px-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-cyan-600 text-white">
                <ShieldCheck size={19} />
              </span>
              <span className="text-[15px] font-semibold">Personal Red Team</span>
            </div>
            <nav className="flex-1">
              <NavLinks pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </aside>
        </div>
      )}

      {/* Content */}
      <main className="px-4 pb-12 pt-20 sm:px-6 lg:ml-60 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Brain, Target, Activity, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Shield },
  { name: "Simulations", href: "/simulations", icon: Target },
  { name: "Threats", href: "/threats", icon: Brain },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-surface-800 bg-surface-900">
        <div className="flex h-16 items-center gap-2 border-b border-surface-800 px-6">
          <Shield className="h-8 w-8 text-primary-500" />
          <span className="text-lg font-bold text-white">PRT</span>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-surface-400 hover:bg-surface-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}

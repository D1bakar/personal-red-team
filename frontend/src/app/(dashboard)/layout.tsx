"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { name: "Dashboard", href: "/", icon: "◉" },
  { name: "Simulations", href: "/simulations", icon: "◎" },
  { name: "Threats", href: "/threats", icon: "◈" },
  { name: "Analytics", href: "/analytics", icon: "◇" },
  { name: "Settings", href: "/settings", icon: "◆" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-60 border-r-[3px] border-black bg-white h-screen fixed top-0 left-0 z-40">
        <div className="h-14 border-b-[3px] border-black flex items-center px-4">
          <div className="flex h-8 w-8 items-center justify-center border-[3px] border-black bg-black text-cream text-[10px] font-black">
            PRT
          </div>
          <span className="ml-2 font-bold text-xs uppercase tracking-wider">Personal Red Team</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                  active
                    ? "bg-black text-cream border-[3px] border-black shadow-[3px_3px_0px_0px_#E8E4DA]"
                    : "border-[3px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_#000]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t-[3px] border-black">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider border-[3px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_#000] transition-all duration-150">
            <span>×</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b-[3px] border-black bg-cream flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-black text-cream text-[9px] font-black">PRT</div>
          <span className="font-bold text-xs uppercase tracking-wider">Dashboard</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="brutalist-btn text-xs py-1 px-2">
          {sidebarOpen ? "×" : "☰"}
        </button>
      </div>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-cream border-r-[3px] border-black p-3 space-y-1 animate-slide-in-left">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                    active
                      ? "bg-black text-cream border-[3px] border-black"
                      : "border-[3px] border-transparent hover:border-black"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-3 border-t-[3px] border-black mt-3">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider">
                <span>×</span>
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8 max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

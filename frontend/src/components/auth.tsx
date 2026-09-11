import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-cyan-600 text-white shadow-glow">
            <ShieldCheck size={22} strokeWidth={2.2} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink-900">
            Personal Red Team
          </span>
        </Link>
        <h1 className="h-display mt-6 text-2xl">{title}</h1>
        {subtitle && <p className="subtle mt-1.5">{subtitle}</p>}
      </div>
      <div className="card p-6 sm:p-8">{children}</div>
    </div>
  );
}

export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex items-center justify-between text-[13px] font-medium">{children}</div>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-teal-700 transition-colors hover:text-teal-600">
      {children}
    </Link>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-mist via-[#E9F3F1] to-[#E4EEF7] p-4 py-10">
      <div className="ambient" aria-hidden>
        <div className="orb left-[-120px] top-[-120px] h-[420px] w-[420px] bg-teal-200/50 animate-float-slow" />
        <div className="orb bottom-[-160px] right-[-120px] h-[480px] w-[480px] bg-cyan-200/50 animate-float-slower" />
        <div className="orb left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 bg-sky-100/60" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

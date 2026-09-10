import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-black text-[#FFFBF0] text-xs font-black">PRT</div>
        </Link>
        {children}
      </div>
    </div>
  );
}

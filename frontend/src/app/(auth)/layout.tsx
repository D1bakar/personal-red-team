import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-primary-500" />
          <h1 className="mt-4 text-2xl font-bold text-white">Personal Red Team</h1>
          <p className="mt-2 text-surface-400">AI-Powered Social Engineering Defense</p>
        </div>
        {children}
      </div>
    </div>
  );
}

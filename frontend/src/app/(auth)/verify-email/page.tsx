"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { AuthLink, AuthShell } from "@/components/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    api
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      });
  }, [token]);

  return (
    <AuthShell title="Email verification" subtitle="Confirming your address">
      <div className="py-2 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={28} className="animate-spin text-teal-600" />
            <p className="subtle">Verifying…</p>
          </div>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={26} />
            </span>
            <div className="alert-success">Your email is verified. You&apos;re all set.</div>
            <AuthLink href="/login">Continue to sign in</AuthLink>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <XCircle size={26} />
            </span>
            <div className="alert-error">{message}</div>
            <AuthLink href="/login">Back to sign in</AuthLink>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

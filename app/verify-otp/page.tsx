"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { verifyOtpCode, resendOtpCode } from "@/lib/marketplace";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const email = params.get("email") || "";

  const [digits, setDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const updateDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((digit, digitIndex) => (digitIndex === index ? nextValue : digit)));
    if (nextValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await verifyOtpCode(email, otp);
      setMessage("Verification complete. Redirecting to dashboard...");
      window.setTimeout(() => router.push("/dashboard"), 700);
    } catch (nextError: any) {
      setError(nextError?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      setResending(true);
      setError("");
      await resendOtpCode(email);
      setCountdown(60);
      setMessage("OTP sent again. Demo mode uses 123456.");
    } catch (nextError: any) {
      setError(nextError?.message || "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <Card className="w-full border-white/80 bg-white/90 p-8 shadow-2xl">
          <h1 className="text-3xl font-semibold text-slate-950">Verify OTP</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the 6-digit code sent to <strong>{email || "your email"}</strong>. Demo mode uses
            <strong> 123456</strong>.
          </p>

          {message ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form className="mt-6 space-y-6" onSubmit={submit}>
            <div className="grid grid-cols-6 gap-2">
              {digits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  className="h-12 px-0 text-center text-lg font-semibold"
                  inputMode="numeric"
                  maxLength={1}
                />
              ))}
            </div>

            <Button className="h-11 w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-sm">
            <Button variant="outline" className="h-11 w-full border-slate-200 bg-white" onClick={resend} disabled={resending || countdown > 0}>
              {resending ? "Sending..." : countdown > 0 ? `Resend OTP in 0:${String(countdown).padStart(2, "0")}` : "Resend OTP"}
            </Button>
            <div className="flex items-center justify-between text-slate-500">
              <Link href="/signup" className="text-[#2563EB] hover:underline">
                Start again
              </Link>
              <Link href="/signin" className="hover:text-slate-700">
                Back to sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

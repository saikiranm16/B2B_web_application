"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Clock, Shield } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const email = params.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  const otp = digits.join("");
  const isOtpComplete = digits.every((digit) => digit.length === 1);
  const emailMissing = !email;
  const displayedError = error || (emailMissing ? "Missing email. Please register again." : "");

  useEffect(() => {
    if (email) {
      inputRefs.current[0]?.focus();
    }
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const updateDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);

    setDigits((current) => {
      const nextDigits = [...current];
      nextDigits[index] = cleaned;
      return nextDigits;
    });

    setError("");

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedValue[index] || "");
    setDigits(nextDigits);
    setError("");

    const nextIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (emailMissing) {
      setError("Missing email. Please register again.");
      return;
    }

    if (!isOtpComplete) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      localStorage.setItem("token", response.token);
      setSuccess("Email verified. Redirecting...");

      window.setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (err: unknown) {
      const message = String(err instanceof Error ? err.message : "Something went wrong");

      if (message.toLowerCase().includes("expired")) {
        setError("This OTP has expired. Please request a new code.");
      } else if (message.toLowerCase().includes("invalid")) {
        setError("Wrong OTP. Please check the code and try again.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError("");
      setSuccess("");

      await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setCountdown(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
      setSuccess("A new OTP has been sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="OTP verification"
      title="Confirm the account and enter the workspace."
      description="Verify the 6-digit code we sent to your email so the onboarding and dashboard flows can start cleanly."
      asideTitle="Helpful behavior"
      asideDescription="You can type digit by digit, paste the full code, or resend once the timer completes."
      points={[
        "Clear inline success and error states.",
        "Keyboard-friendly OTP inputs with paste support.",
        "Smooth handoff into the dashboard after verification.",
      ]}
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#16324f]">Verify OTP</h2>
        <p className="text-sm leading-6 text-slate-500">
          Enter the 6-digit code sent to {email || "your email"}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700">OTP code</Label>
          <div className="grid grid-cols-6 gap-2">
            {digits.map((digit, index) => (
              <Input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                className="h-12 rounded-2xl border-slate-200 px-0 text-center text-lg font-bold"
              />
            ))}
          </div>
          <p className="text-xs text-slate-500">You can also paste the full OTP into any box.</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#f8fbff] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-[#1d72f3]" />
            <span>Resend available in</span>
          </div>
          <span className="text-sm font-semibold text-[#16324f]">
            {countdown > 0 ? formatTime(countdown) : "0:00"}
          </span>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        {displayedError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {displayedError}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading || !isOtpComplete}
          className="h-12 w-full rounded-2xl bg-[#1d72f3] text-white hover:bg-[#135fd1]"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleResendOtp}
          disabled={countdown > 0 || resendLoading || emailMissing}
          className="h-12 w-full rounded-2xl border-slate-200 bg-white"
        >
          {resendLoading
            ? "Sending..."
            : countdown > 0
              ? `Resend OTP in ${formatTime(countdown)}`
              : "Resend OTP"}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Shield className="h-4 w-4 text-[#1d72f3]" />
          Need a different email?
          <Link href={`/signup?email=${encodeURIComponent(email)}`} className="font-semibold text-[#1d72f3] hover:underline">
            Go back
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

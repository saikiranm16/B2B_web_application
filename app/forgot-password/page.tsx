"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      return;
    }
    setSubmitted(true);
  };

  return (
    <AuthShell
      eyebrow="Password help"
      title="Recover access without getting lost."
      description="This frontend page gives users a clear recovery entry point even before a full password reset backend is connected."
      asideTitle="Current behavior"
      asideDescription="The screen is intentionally safe and non-destructive. It collects the email and communicates the current product state clearly."
      points={[
        "No backend reset call is triggered yet.",
        "The page prevents dead links from the sign-in form.",
        "It keeps the user in a polished, understandable recovery flow.",
      ]}
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#16324f]">Forgot password</h2>
        <p className="text-sm leading-6 text-slate-500">
          Enter your email address and we&apos;ll guide you to the next step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-12 rounded-2xl border-slate-200 bg-white"
            required
          />
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#16324f]">
            Password reset backend flow is not wired yet. The frontend is ready, and you can return to sign in or register again.
          </div>
        ) : null}

        <Button type="submit" className="h-12 w-full rounded-2xl bg-[#1d72f3] text-white hover:bg-[#135fd1]">
          Continue
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link href="/signin" className="font-semibold text-[#1d72f3] hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

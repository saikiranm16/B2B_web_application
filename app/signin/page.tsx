"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDemoCredentials, loginAccount } from "@/lib/marketplace";

export default function SigninPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const demoCredentials = getDemoCredentials();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      await loginAccount(form.email, form.password);
      router.push("/dashboard");
    } catch (nextError: any) {
      setError(nextError?.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2563EB]">ProcureLink</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight text-slate-950">
              Frontend-ready B2B procurement workspace for buyers and suppliers.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Sign in with the live backend if available, or use the built-in demo accounts when the frontend is
              being reviewed in isolation.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {demoCredentials.map((account) => (
              <Card key={account.role} className="border-white/80 bg-white/85 p-5 shadow-xl">
                <p className="text-sm font-semibold text-slate-900">{account.role} demo</p>
                <p className="mt-2 text-sm text-slate-600">{account.email}</p>
                <p className="mt-1 text-sm text-slate-500">{account.password}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-white/80 bg-white/90 p-8 shadow-2xl">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Access the protected workspace.</p>
          </div>

          {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form className="mt-6 space-y-5" onSubmit={submit}>
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 size-4 text-slate-400" />
                <Input className="h-11 pl-10" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 size-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="h-11 pl-10 pr-10"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <button type="button" className="absolute right-3 top-3.5 text-slate-400" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Button className="h-11 w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <Link href="/signup" className="text-[#2563EB] hover:underline">
              Create account
            </Link>
            <Link href="/" className="hover:text-slate-700">
              Back to home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      {children}
    </div>
  );
}

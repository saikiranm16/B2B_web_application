"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAccount, type EntityType, type UserRole } from "@/lib/marketplace";

export default function SignupPage() {
  const params = useSearchParams();
  const router = useRouter();
  const defaultRole = ((params.get("role") || "BUYER").toUpperCase() as UserRole) || "BUYER";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: params.get("email") || "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
    entityType: "COMPANY" as EntityType,
  });

  const roleCopy = useMemo(
    () =>
      form.role === "BUYER"
        ? "Buyers post requirements, review bids, and manage awards."
        : "Suppliers discover opportunities, submit bids, and grow visibility.",
    [form.role]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await registerAccount({
        email: form.email,
        password: form.password,
        role: form.role,
        entityType: form.entityType,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (nextError: any) {
      setError(nextError?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_440px] lg:items-center">
        <div className="space-y-8">
          <div>
            <Badge className="bg-[#10213d] text-white hover:bg-[#10213d]">Marketplace onboarding</Badge>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight text-slate-950">
              Create a buyer or supplier account and continue into guided onboarding.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              The signup flow uses the live API when available and cleanly falls back to local demo mode for
              frontend evaluation. Demo OTP is <strong>123456</strong>.
            </p>
          </div>
          <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
            <p className="text-sm font-semibold text-slate-900">{form.role} account</p>
            <p className="mt-2 text-sm text-slate-600">{roleCopy}</p>
          </Card>
        </div>

        <Card className="border-white/80 bg-white/90 p-8 shadow-2xl">
          <h2 className="text-3xl font-semibold text-slate-950">Create account</h2>
          <p className="mt-2 text-sm text-slate-500">Pick your role and start the 3-step profile setup.</p>

          {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form className="mt-6 space-y-5" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              {(["BUYER", "SUPPLIER"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    form.role === role
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <Field label="Entity type">
              <select
                value={form.entityType}
                onChange={(event) => setForm({ ...form, entityType: event.target.value as EntityType })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="SMALL_BUSINESS">Small Business</option>
                <option value="COMPANY">Company</option>
              </select>
            </Field>

            <Field label="Email">
              <Input className="h-11" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label="Password">
              <Input className="h-11" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </Field>
            <Field label="Confirm password">
              <Input className="h-11" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
            </Field>

            <Button className="h-11 w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <Link href="/signin" className="text-[#2563EB] hover:underline">
              Already have an account?
            </Link>
            <Link href="/" className="hover:text-slate-700">
              Home
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

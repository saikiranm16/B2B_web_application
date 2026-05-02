"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") || "BUYER").toUpperCase();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
    entityType: "INDIVIDUAL",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!form.email) return "Email is required.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.password)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(form.password)) return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(form.password)) return "Password must contain a number.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          entityType: form.entityType,
        }),
      });

      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Buyer and supplier signup"
      title="Create the account that starts your workflow."
      description="Choose the right role, register quickly, and move into onboarding without having to decode the product first."
      asideTitle="Why the flow is simpler now"
      asideDescription="The UI explains choices earlier, reduces clutter, and keeps the next step obvious on small and large screens."
      points={[
        "Role-first signup for buyer and supplier paths.",
        "Clear password rules before submission.",
        "OTP verification handoff after registration.",
      ]}
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#16324f]">Create account</h2>
        <p className="text-sm leading-6 text-slate-500">Start your procurement journey with a cleaner setup flow.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700">I am joining as</Label>
          <div className="grid grid-cols-2 gap-3">
            {["BUYER", "SUPPLIER"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                  form.role === role
                    ? "border-[#1d72f3] bg-blue-50 text-[#16324f]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {role === "BUYER" ? "Buyer" : "Supplier"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entityType" className="text-sm font-semibold text-slate-700">
            Entity type
          </Label>
          <select
            id="entityType"
            name="entityType"
            value={form.entityType}
            onChange={(event) => setForm({ ...form, entityType: event.target.value })}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#1d72f3] focus:ring-2 focus:ring-[#1d72f3]/20"
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="SMALL_BUSINESS">Small business</option>
            <option value="COMPANY">Company</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => {
                setForm({ ...form, email: event.target.value });
                if (error) setError("");
              }}
              className="h-12 rounded-2xl border-slate-200 bg-white pl-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={form.password}
              onChange={(event) => {
                setForm({ ...form, password: event.target.value });
                if (error) setError("");
              }}
              className="h-12 rounded-2xl border-slate-200 bg-white pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Use at least 8 characters with uppercase, lowercase, and a number.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(event) => {
                setForm({ ...form, confirmPassword: event.target.value });
                if (error) setError("");
              }}
              className="h-12 rounded-2xl border-slate-200 bg-white pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
              aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-[#1d72f3] text-white hover:bg-[#135fd1]"
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-[#1d72f3] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

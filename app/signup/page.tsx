"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.email) return "Email is required";
    if (!form.email.includes("@")) return "Please enter a valid email";
    if (!form.password) return "Password is required";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(form.password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(form.password)) return "Password must contain a number";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      return setError(validationError);
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
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
            ProcureLink
          </h2>
        </div>
        <p className="text-slate-600 text-sm">Join the procurement revolution</p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-lg border-0">
        <div className="p-8 space-y-6">
          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold" style={{ color: "#1E3A5F" }}>
              Create Account
            </h1>
            <p className="text-slate-500 text-sm">
              Start your procurement journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                I am a
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "BUYER" })}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 ${
                    form.role === "BUYER"
                      ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "SUPPLIER" })}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 ${
                    form.role === "SUPPLIER"
                      ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Supplier
                </button>
              </div>
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType" className="text-sm font-semibold text-slate-700">
                Entity Type
              </Label>
              <select
                id="entityType"
                name="entityType"
                value={form.entityType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white text-slate-900 text-sm"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="SMALL_BUSINESS">Small Business</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-semibold rounded-lg transition-all duration-200 text-white"
              style={{
                backgroundColor: loading ? "#94a3b8" : "#2563EB",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#2563EB")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link href="/signin">
            <Button
              type="button"
              variant="outline"
              className="w-full py-2.5 font-semibold rounded-lg border-2 border-slate-200 hover:bg-slate-50 transition-all"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-600">
        <p>
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-[#2563EB] hover:underline">
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-[#2563EB] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

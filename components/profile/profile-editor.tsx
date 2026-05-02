"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck, UserRound } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type BuyerProfile = {
  companyName?: string | null;
  location?: string | null;
  aadhaar?: string | null;
  pan?: string | null;
  gst?: string | null;
  cin?: string | null;
  moa?: string | null;
  workOrder?: string | null;
};

type SupplierProfile = {
  companyName?: string | null;
  location?: string | null;
  gst?: string | null;
  yearEstablished?: string | number | null;
  supplierType?: string | null;
};

type ProfileResponse = {
  id: string;
  email: string;
  role: "BUYER" | "SUPPLIER";
  entityType?: string | null;
  isVerified?: boolean;
  kycStatus?: string | null;
  tier?: string | null;
  buyerProfile?: BuyerProfile | null;
  supplierProfile?: SupplierProfile | null;
};

type ProfileFormState = {
  companyName: string;
  location: string;
  aadhaar: string;
  pan: string;
  gst: string;
  cin: string;
  moa: string;
  workOrder: string;
  yearEstablished: string;
  supplierType: string;
};

const emptyForm: ProfileFormState = {
  companyName: "",
  location: "",
  aadhaar: "",
  pan: "",
  gst: "",
  cin: "",
  moa: "",
  workOrder: "",
  yearEstablished: "",
  supplierType: "MANUFACTURER",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ProfileEditor() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBuyer = profile?.role === "BUYER";
  const isSupplier = profile?.role === "SUPPLIER";

  const profileBadge = useMemo(() => {
    if (!profile) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]">
          {profile.role}
        </Badge>
        <Badge variant="secondary">{profile.tier || "FREE"}</Badge>
        <Badge variant={profile.isVerified ? "default" : "outline"}>
          {profile.isVerified ? "Verified" : "Pending"}
        </Badge>
        <Badge variant="outline">KYC {profile.kycStatus || "PENDING"}</Badge>
      </div>
    );
  }, [profile]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/me");
        setProfile(data);

        if (data.role === "BUYER") {
          setForm({
            ...emptyForm,
            companyName: data.buyerProfile?.companyName || "",
            location: data.buyerProfile?.location || "",
            aadhaar: data.buyerProfile?.aadhaar || "",
            pan: data.buyerProfile?.pan || "",
            gst: data.buyerProfile?.gst || "",
            cin: data.buyerProfile?.cin || "",
            moa: data.buyerProfile?.moa || "",
            workOrder: data.buyerProfile?.workOrder || "",
          });
        }

        if (data.role === "SUPPLIER") {
          setForm({
            ...emptyForm,
            companyName: data.supplierProfile?.companyName || "",
            location: data.supplierProfile?.location || "",
            gst: data.supplierProfile?.gst || "",
            yearEstablished: data.supplierProfile?.yearEstablished?.toString() || "",
            supplierType: data.supplierProfile?.supplierType || "MANUFACTURER",
          });
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load profile."));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!profile) {
      setError("Profile is not loaded yet.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = profile.role === "BUYER"
        ? {
            companyName: form.companyName,
            location: form.location,
            aadhaar: form.aadhaar,
            pan: form.pan,
            gst: form.gst,
            cin: form.cin,
            moa: form.moa,
            workOrder: form.workOrder,
          }
        : {
            companyName: form.companyName,
            location: form.location,
            gst: form.gst,
            yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : undefined,
            supplierType: form.supplierType,
          };

      const updated = await apiFetch("/api/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setProfile((current) => {
        if (!current) {
          return current;
        }

        return current.role === "BUYER"
          ? { ...current, buyerProfile: updated }
          : { ...current, supplierProfile: updated };
      });

      setSuccess("Profile saved successfully.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          <p className="text-sm font-medium text-slate-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 rounded-lg border-slate-200">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-linear-to-r from-[#1E3A5F] to-[#2563EB] px-8 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="mt-1 text-sm text-blue-100">View and update your account details</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 bg-white px-8 py-8">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Account Email</p>
                  <p className="text-lg font-semibold text-slate-900">{profile?.email}</p>
                </div>
                {profileBadge}
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Company Name</Label>
                  <Input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Location</Label>
                  <Input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {isBuyer ? (
                <div className="space-y-6 rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                    <h2 className="text-lg font-semibold text-slate-900">Buyer Details</h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Aadhaar</Label>
                      <Input name="aadhaar" value={form.aadhaar} onChange={handleChange} placeholder="Aadhaar number" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">PAN</Label>
                      <Input name="pan" value={form.pan} onChange={handleChange} placeholder="PAN number" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">GST</Label>
                      <Input name="gst" value={form.gst} onChange={handleChange} placeholder="GST number" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">CIN</Label>
                      <Input name="cin" value={form.cin} onChange={handleChange} placeholder="CIN number" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">MOA</Label>
                      <Input name="moa" value={form.moa} onChange={handleChange} placeholder="MOA reference" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Work Order</Label>
                      <Input name="workOrder" value={form.workOrder} onChange={handleChange} placeholder="Work order reference" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>
                  </div>
                </div>
              ) : null}

              {isSupplier ? (
                <div className="space-y-6 rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                    <h2 className="text-lg font-semibold text-slate-900">Supplier Details</h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">GST</Label>
                      <Input name="gst" value={form.gst} onChange={handleChange} placeholder="GST number" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Year Established</Label>
                      <Input name="yearEstablished" value={form.yearEstablished} onChange={handleChange} placeholder="e.g. 2018" inputMode="numeric" className="h-11 rounded-lg border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Supplier Type</Label>
                      <select
                        name="supplierType"
                        value={form.supplierType}
                        onChange={handleChange}
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="MANUFACTURER">Manufacturer</option>
                        <option value="TRADER">Trader</option>
                        <option value="SERVICE_PROVIDER">Service Provider</option>
                        <option value="DISTRIBUTOR">Distributor</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href="/dashboard">
                  <Button type="button" variant="outline" className="h-11 rounded-lg border-slate-200 px-6 font-semibold text-slate-700">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-lg px-6 font-semibold text-white"
                  style={{ backgroundColor: saving ? "#94a3b8" : "#2563EB" }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

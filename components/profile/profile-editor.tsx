"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BadgeCheck, Globe2, ShieldCheck } from "lucide-react";

import { useMarketplaceSession } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_OPTIONS,
  INDIA_STATES,
  type SupplierType,
  SUPPLIER_TYPE_OPTIONS,
  saveCurrentProfile,
} from "@/lib/marketplace";

export function ProfileEditor() {
  const { profile, refreshProfile, profileCompletion } = useMarketplaceSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    city: "",
    state: "",
    gst: "",
    supplierType: "MANUFACTURER" as SupplierType,
    productCategories: [] as string[],
    reachStates: [] as string[],
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      fullName: profile.fullName,
      companyName: profile.companyName,
      city: profile.city,
      state: profile.state,
      gst: profile.gst,
      supplierType: profile.supplierType || "MANUFACTURER",
      productCategories: profile.productCategories || [],
      reachStates: profile.reachStates || [],
    });
  }, [profile]);

  if (!profile) {
    return null;
  }

  const toggleValue = (key: "productCategories" | "reachStates", value: string) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await saveCurrentProfile({
        fullName: form.fullName,
        companyName: form.companyName,
        city: form.city,
        state: form.state,
        gst: form.gst,
        workOrderTypes: profile.workOrderTypes,
        supplierType: profile.role === "SUPPLIER" ? form.supplierType : undefined,
        productCategories: profile.role === "SUPPLIER" ? form.productCategories : undefined,
        reachStates: profile.role === "SUPPLIER" ? form.reachStates : undefined,
        documents: profile.documents,
        onboardingCompleted: profile.onboardingCompleted,
      });
      await refreshProfile();
      setMessage("Profile saved.");
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Badge className="bg-[#10213d] text-white hover:bg-[#10213d]">Company profile</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Public trust and company profile</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep the core identity fields clean, update supplier discoverability, and maintain the same details
              shown across the dashboard and requirement workflow.
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Completion</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{profileCompletion}%</p>
            <p className="mt-2 text-sm text-slate-600">Profile views: {profile.profileViews}</p>
          </div>
        </div>
      </Card>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name">
              <Input className="h-11" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            </Field>
            <Field label="Company name">
              <Input className="h-11" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
            </Field>
            <Field label="City">
              <Input className="h-11" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </Field>
            <Field label="State">
              <select
                value={form.state}
                onChange={(event) => setForm({ ...form, state: event.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Select state</option>
                {INDIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="GST">
              <Input className="h-11" value={form.gst} onChange={(event) => setForm({ ...form, gst: event.target.value.toUpperCase() })} />
            </Field>
            {profile.role === "SUPPLIER" ? (
              <Field label="Supplier type">
                <select
                  value={form.supplierType}
                  onChange={(event) => setForm({ ...form, supplierType: event.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                >
                  {SUPPLIER_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </div>

          {profile.role === "SUPPLIER" ? (
            <div className="mt-8 space-y-6 border-t border-slate-200 pt-6">
              <TagGroup label="Product categories" values={CATEGORY_OPTIONS} selected={form.productCategories} onToggle={(value) => toggleValue("productCategories", value)} />
              <TagGroup label="Geographic supply reach" values={INDIA_STATES} selected={form.reachStates} onToggle={(value) => toggleValue("reachStates", value)} />
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
            <p className="text-sm font-semibold text-slate-900">Trust summary</p>
            <div className="mt-4 space-y-3">
              <SummaryRow icon={<BadgeCheck className="size-4 text-emerald-600" />} label="Email verification" value={profile.isVerified ? "Verified" : "Pending"} />
              <SummaryRow icon={<ShieldCheck className="size-4 text-[#2563EB]" />} label="KYC status" value={profile.kycStatus} />
              <SummaryRow icon={<Globe2 className="size-4 text-indigo-600" />} label="Account tier" value={profile.tier} />
            </div>
          </Card>

          <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
            <p className="text-sm font-semibold text-slate-900">Documents</p>
            <div className="mt-4 space-y-3">
              {profile.documents?.length ? (
                profile.documents.map((document) => (
                  <div key={document.label} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="font-medium text-slate-900">{document.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{document.fileName}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No document placeholders recorded yet.
                </div>
              )}
            </div>
          </Card>
        </div>
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

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function TagGroup({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <div className="mt-3 flex flex-wrap gap-3">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

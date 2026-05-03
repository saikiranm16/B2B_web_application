"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, UploadCloud } from "lucide-react";

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
  WORK_ORDER_OPTIONS,
  saveCurrentProfile,
} from "@/lib/marketplace";

type FormState = {
  fullName: string;
  companyName: string;
  city: string;
  state: string;
  gst: string;
  workOrderTypes: string[];
  supplierType: SupplierType;
  productCategories: string[];
  reachStates: string[];
  documents: { label: string; fileName: string }[];
};

const DOCUMENT_LABELS = ["Company PAN", "GST Certificate", "Address Proof"];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, refreshProfile, profileCompletion } = useMarketplaceSession();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    fullName: "",
    companyName: "",
    city: "",
    state: "",
    gst: "",
    workOrderTypes: [],
    supplierType: "MANUFACTURER",
    productCategories: [],
    reachStates: [],
    documents: DOCUMENT_LABELS.map((label) => ({ label, fileName: "" })),
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
      workOrderTypes: profile.workOrderTypes,
      supplierType: profile.supplierType || "MANUFACTURER",
      productCategories: profile.productCategories || [],
      reachStates: profile.reachStates || [],
      documents:
        profile.documents?.length
          ? DOCUMENT_LABELS.map((label) => ({
              label,
              fileName: profile.documents?.find((document) => document.label === label)?.fileName || "",
            }))
          : DOCUMENT_LABELS.map((label) => ({ label, fileName: "" })),
    });
  }, [profile]);

  const completion = useMemo(() => Math.max(profileCompletion, Math.round((step / 3) * 100)), [profileCompletion, step]);

  if (!profile) {
    return null;
  }

  const toggleSelection = (key: "workOrderTypes" | "productCategories" | "reachStates", value: string) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
    setError("");
    setMessage("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName || !form.city || !form.state || !form.gst || form.workOrderTypes.length === 0) {
        return "Complete all Step 1 fields before continuing.";
      }
    }

    if (step === 2 && profile.role === "SUPPLIER") {
      if (!form.supplierType || form.productCategories.length === 0 || form.reachStates.length === 0) {
        return "Suppliers need type, categories, and geographic reach before continuing.";
      }
    }

    return "";
  };

  const persistPartial = async (complete = false) => {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return false;
    }

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
        workOrderTypes: form.workOrderTypes,
        supplierType: profile.role === "SUPPLIER" ? form.supplierType : undefined,
        productCategories: profile.role === "SUPPLIER" ? form.productCategories : undefined,
        reachStates: profile.role === "SUPPLIER" ? form.reachStates : undefined,
        documents: form.documents.filter((document) => document.fileName),
        onboardingCompleted: complete,
      });
      await refreshProfile();
      setMessage(complete ? "Onboarding completed. Redirecting to dashboard..." : "Progress saved.");
      return true;
    } catch (nextError: any) {
      setError(nextError?.message || "Failed to save onboarding details.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    const saved = await persistPartial(false);
    if (saved) {
      setStep((current) => Math.min(current + 1, 3));
    }
  };

  const previousStep = () => {
    setError("");
    setMessage("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const completeOnboarding = async () => {
    const saved = await persistPartial(true);
    if (saved) {
      window.setTimeout(() => router.push("/dashboard"), 700);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Badge className="bg-[#10213d] text-white hover:bg-[#10213d]">3-step onboarding</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              Build a stronger buyer or supplier profile before you go live.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Steps 1 and 2 save into your profile. Step 3 is a document placeholder flow with file inputs
              only, so there is no upload API dependency here.
            </p>
          </div>
          <div className="min-w-[220px] rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Completion</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{completion}%</p>
            <div className="mt-4 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#60a5fa_100%)]"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="border-white/80 bg-white/85 p-5 shadow-xl">
          <div className="space-y-3">
            {[
              { id: 1, title: "Step 1", helper: "Identity, location, work orders, GST" },
              {
                id: 2,
                title: "Step 2",
                helper:
                  profile.role === "SUPPLIER"
                    ? "Supplier type, categories, and reach"
                    : "Buyer review and save checkpoint",
              },
              { id: 3, title: "Step 3", helper: "Document placeholders only" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                className={`w-full rounded-[22px] border p-4 text-left transition ${
                  step === item.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                  </div>
                  {step > item.id ? <Check className="size-4 text-emerald-600" /> : <ChevronRight className="size-4 text-slate-400" />}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
          {message ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Step 1: core business identity</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This step is shared across both roles and feeds your top-level trust summary.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full name">
                  <Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="h-11" />
                </Field>
                <Field label="Company or entity name">
                  <Input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} className="h-11" />
                </Field>
                <Field label="City">
                  <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="h-11" />
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
                <Field label="GST number">
                  <Input value={form.gst} onChange={(event) => setForm({ ...form, gst: event.target.value.toUpperCase() })} className="h-11" />
                </Field>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Work order types</Label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {WORK_ORDER_OPTIONS.map((option) => {
                    const active = form.workOrderTypes.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleSelection("workOrderTypes", option)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          active
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Step 2: {profile.role === "SUPPLIER" ? "market fit and geographic reach" : "buyer save checkpoint"}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {profile.role === "SUPPLIER"
                    ? "Suppliers define how they show up in search, filters, and opportunity matching."
                    : "Buyer profiles save here after Step 1 with a clean confirmation checkpoint."}
                </p>
              </div>

              {profile.role === "SUPPLIER" ? (
                <>
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
                  <TagSelector
                    label="Product categories"
                    values={CATEGORY_OPTIONS}
                    selected={form.productCategories}
                    onToggle={(value) => toggleSelection("productCategories", value)}
                  />
                  <TagSelector
                    label="Geographic supply reach"
                    values={INDIA_STATES}
                    selected={form.reachStates}
                    onToggle={(value) => toggleSelection("reachStates", value)}
                  />
                </>
              ) : (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="font-medium text-slate-900">Buyer review</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Step 1 already captures the required buyer identity fields in this frontend-only scope. Use
                    the next button to persist the checkpoint and continue to document placeholders.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Step 3: document placeholders</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Files are stored locally by name only so the frontend behaves cleanly without an upload API.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {form.documents.map((document, index) => (
                  <label
                    key={document.label}
                    className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-slate-400 hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#2563EB]">
                        <UploadCloud className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{document.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {document.fileName || "No file chosen yet"}
                        </p>
                        <input
                          type="file"
                          className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                          onChange={(event) => {
                            const fileName = event.target.files?.[0]?.name || "";
                            setForm((current) => ({
                              ...current,
                              documents: current.documents.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, fileName } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={previousStep} disabled={step === 1 || saving}>
              Previous
            </Button>
            <div className="flex gap-3">
              {step < 3 ? (
                <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={nextStep} disabled={saving}>
                  {saving ? "Saving..." : "Save and continue"}
                </Button>
              ) : (
                <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={completeOnboarding} disabled={saving}>
                  {saving ? "Completing..." : "Complete onboarding"}
                </Button>
              )}
            </div>
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

function TagSelector({
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

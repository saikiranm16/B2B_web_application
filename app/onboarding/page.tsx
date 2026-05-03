"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Role = "BUYER" | "SUPPLIER";

type Category = {
  id: string;
  name: string;
  slug?: string;
};

type OnboardingForm = {
  fullName: string;
  city: string;
  state: string;
  sectors: string[];
  contractTypes: string[];
  gst: string;
  dipp: string;
  supplierType: string;
  categories: string[];
  supplyReach: string;
  pan: string;
};

const sectorOptions = [
  "Manufacturing",
  "Construction",
  "Healthcare",
  "Retail",
  "Logistics",
  "IT Services",
  "Agriculture",
  "Energy",
];

const contractTypeOptions = [
  "One-time purchase",
  "Rate contract",
  "Annual maintenance",
  "Framework agreement",
  "Service contract",
  "Government tender",
];

const supplierTypes = ["MANUFACTURER", "TRADER", "IMPORTER", "DISTRIBUTOR"];

const fallbackCategories: Category[] = [
  { id: "steel", name: "Steel & Metals" },
  { id: "electrical", name: "Electrical" },
  { id: "safety", name: "Safety Equipment" },
  { id: "packaging", name: "Packaging" },
  { id: "machinery", name: "Machinery" },
  { id: "office", name: "Office Supplies" },
];

const emptyForm: OnboardingForm = {
  fullName: "",
  city: "",
  state: "",
  sectors: [],
  contractTypes: [],
  gst: "",
  dipp: "",
  supplierType: "MANUFACTURER",
  categories: [],
  supplyReach: "",
  pan: "",
};

function getSavedForm(role: Role): OnboardingForm {
  const saved = localStorage.getItem(`procurelink:onboarding:${role}`);
  if (!saved) {
    return emptyForm;
  }

  try {
    return { ...emptyForm, ...JSON.parse(saved) };
  } catch {
    return emptyForm;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function decodeRole(token: string): Role {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "SUPPLIER" ? "SUPPLIER" : "BUYER";
  } catch {
    return "BUYER";
  }
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("BUYER");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingForm>(emptyForm);
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const completion = useMemo(() => {
    const common = [form.fullName, form.city, form.state];
    const commonScore = common.filter(Boolean).length + (form.sectors.length ? 1 : 0);
    const roleScore =
      role === "BUYER"
        ? [form.contractTypes.length ? "ok" : "", form.gst, form.dipp].filter(Boolean).length
        : [
            form.supplierType,
            form.categories.length ? "ok" : "",
            form.supplyReach,
            form.gst,
          ].filter(Boolean).length;
    const docsScore = [form.pan, form.gst].filter(Boolean).length;
    const total = role === "BUYER" ? 9 : 10;
    return Math.min(100, Math.round(((commonScore + roleScore + docsScore) / total) * 100));
  }, [form, role]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/signin");
        return;
      }

      const detectedRole = decodeRole(token);
      setRole(detectedRole);
      setForm(getSavedForm(detectedRole));
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await apiFetch("/api/categories");
        const nextCategories = Array.isArray(data) ? data : data.categories;
        if (Array.isArray(nextCategories) && nextCategories.length) {
          setCategories(nextCategories);
        }
      } catch {
        setCategories(fallbackCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(`procurelink:onboarding:${role}`, JSON.stringify(form));
    }
  }, [form, ready, role]);

  const updateField = (field: keyof OnboardingForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const toggleField = (field: "sectors" | "contractTypes" | "categories", value: string) => {
    setForm((current) => ({
      ...current,
      [field]: toggleValue(current[field], value),
    }));
    setMessage("");
  };

  const saveStep = async () => {
    const location = [form.city, form.state].filter(Boolean).join(", ");
    const payload =
      role === "BUYER"
        ? {
            companyName: form.fullName,
            location,
            gst: form.gst,
            pan: form.pan,
            onboarding: {
              fullName: form.fullName,
              sectors: form.sectors,
              contractTypes: form.contractTypes,
              dipp: form.dipp,
              completion,
            },
          }
        : {
            companyName: form.fullName || "Supplier",
            location: location || "Not specified",
            gst: form.gst || "PENDING",
            yearEstablished: new Date().getFullYear(),
            supplierType: form.supplierType,
            onboarding: {
              fullName: form.fullName,
              sectors: form.sectors,
              categories: form.categories,
              supplyReach: form.supplyReach,
              completion,
            },
          };

    await apiFetch("/api/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  const handleNext = async () => {
    if (step <= 2) {
      try {
        setSaving(true);
        await saveStep();
        setMessage("Progress saved.");
      } catch (error: unknown) {
        setMessage(getErrorMessage(error, "Saved locally. API save is not available yet."));
      } finally {
        setSaving(false);
      }
    }

    setStep((current) => Math.min(3, current + 1));
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      await saveStep();
    } catch {
      localStorage.setItem(`procurelink:onboarding:${role}:completed`, "true");
    } finally {
      setSaving(false);
      router.push("/dashboard");
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
          Loading onboarding...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E3A5F] font-bold text-white">
              P
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#1E3A5F]">Onboarding</h1>
              <p className="text-sm text-slate-500">{role.toLowerCase()} profile setup</p>
            </div>
          </div>
          <Badge variant="outline">{completion}% complete</Badge>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>

        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <div className="grid border-b border-slate-200 sm:grid-cols-3">
            {[
              { value: 1, label: "Company basics", icon: UserRound },
              { value: 2, label: role === "BUYER" ? "Buyer scope" : "Supplier scope", icon: Building2 },
              { value: 3, label: "Documents", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const active = step === item.value;
              const done = step > item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={cn(
                    "flex h-14 items-center justify-center gap-2 border-b px-3 text-sm font-semibold sm:border-b-0 sm:border-r last:sm:border-r-0",
                    active ? "bg-blue-50 text-[#1E3A5F]" : "text-slate-500",
                    done && "text-green-700"
                  )}
                  onClick={() => setStep(item.value)}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Company basics</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Identity, location, and sectors of work.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-3">
                    <Label>Full name</Label>
                    <Input
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={form.state}
                      onChange={(event) => updateField("state", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="Karnataka"
                    />
                  </div>
                  <div className="flex items-end gap-2 text-sm text-slate-500">
                    <MapPin className="mb-3 h-4 w-4" />
                    <span className="mb-3">Used for supplier matching</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Sectors of work</Label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {sectorOptions.map((sector) => (
                      <label
                        key={sector}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                          form.sectors.includes(sector)
                            ? "border-[#2563EB] bg-blue-50 text-[#1E3A5F]"
                            : "border-slate-200 bg-white text-slate-600"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#2563EB]"
                          checked={form.sectors.includes(sector)}
                          onChange={() => toggleField("sectors", sector)}
                        />
                        {sector}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 && role === "BUYER" ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Buyer scope</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Contract preferences and procurement registrations.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Contract types</Label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {contractTypeOptions.map((contract) => (
                      <label
                        key={contract}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                          form.contractTypes.includes(contract)
                            ? "border-[#2563EB] bg-blue-50 text-[#1E3A5F]"
                            : "border-slate-200 bg-white text-slate-600"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#2563EB]"
                          checked={form.contractTypes.includes(contract)}
                          onChange={() => toggleField("contractTypes", contract)}
                        />
                        {contract}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>GST number</Label>
                    <Input
                      value={form.gst}
                      onChange={(event) => updateField("gst", event.target.value.toUpperCase())}
                      className="h-11 border-slate-200"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DIPP number</Label>
                    <Input
                      value={form.dipp}
                      onChange={(event) => updateField("dipp", event.target.value.toUpperCase())}
                      className="h-11 border-slate-200"
                      placeholder="DIPP registration"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 && role === "SUPPLIER" ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Supplier scope</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Capabilities, categories, and supply reach.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Supplier type</Label>
                    <select
                      value={form.supplierType}
                      onChange={(event) => updateField("supplierType", event.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/25"
                    >
                      {supplierTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Geographic supply reach</Label>
                    <Input
                      value={form.supplyReach}
                      onChange={(event) => updateField("supplyReach", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="South India, PAN India"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Product categories</Label>
                    {loadingCategories ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading
                      </span>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                          form.categories.includes(category.id)
                            ? "border-[#2563EB] bg-blue-50 text-[#1E3A5F]"
                            : "border-slate-200 bg-white text-slate-600"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#2563EB]"
                          checked={form.categories.includes(category.id)}
                          onChange={() => toggleField("categories", category.id)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>GST number</Label>
                    <Input
                      value={form.gst}
                      onChange={(event) => updateField("gst", event.target.value.toUpperCase())}
                      className="h-11 border-slate-200"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catalogue upload</Label>
                    <Input type="file" className="h-11 border-slate-200 pt-2" />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Documents</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    KYC references and document placeholders.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>GST number</Label>
                    <Input
                      value={form.gst}
                      onChange={(event) => updateField("gst", event.target.value.toUpperCase())}
                      className="h-11 border-slate-200"
                      placeholder="GST number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN number</Label>
                    <Input
                      value={form.pan}
                      onChange={(event) => updateField("pan", event.target.value.toUpperCase())}
                      className="h-11 border-slate-200"
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {["GST certificate", "PAN card", role === "BUYER" ? "Work order" : "Product brochure"].map(
                    (label) => (
                      <label
                        key={label}
                        className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm font-medium text-slate-600 hover:border-[#2563EB] hover:bg-blue-50"
                      >
                        <Upload className="h-5 w-5 text-[#2563EB]" />
                        <span>{label}</span>
                        <Input type="file" className="hidden" />
                      </label>
                    )
                  )}
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-[#2563EB]" />
                    <div>
                      <p className="text-sm font-semibold text-[#1E3A5F]">Completion</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Your profile is {completion}% complete. You can update missing details later from Profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {message ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {message}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 border-slate-200"
                disabled={step === 1}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  className="h-10 gap-2 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                  disabled={saving}
                  onClick={handleNext}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save and Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="h-10 gap-2 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                  disabled={saving}
                  onClick={handleFinish}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Finish Setup
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

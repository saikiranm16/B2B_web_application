"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  FileUp,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  Plus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug?: string;
};

type RequirementForm = {
  title: string;
  categoryId: string;
  quantity: string;
  unit: string;
  city: string;
  state: string;
  deadline: string;
  budgetMin: string;
  budgetMax: string;
  biddingMode: "SEALED" | "OPEN";
  description: string;
  visibility: "ALL" | "VERIFIED" | "PRIVATE";
};

const fallbackCategories: Category[] = [
  { id: "steel", name: "Steel & Metals" },
  { id: "electrical", name: "Electrical" },
  { id: "safety", name: "Safety Equipment" },
  { id: "packaging", name: "Packaging" },
  { id: "machinery", name: "Machinery" },
  { id: "office", name: "Office Supplies" },
];

const emptyForm: RequirementForm = {
  title: "",
  categoryId: "",
  quantity: "",
  unit: "pcs",
  city: "",
  state: "",
  deadline: "",
  budgetMin: "",
  budgetMax: "",
  biddingMode: "SEALED",
  description: "",
  visibility: "ALL",
};

function currency(value: string) {
  const numeric = Number(value);
  if (!numeric) {
    return "Not set";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function NewRequirementPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RequirementForm>(emptyForm);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [categorySearch, setCategorySearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const selectedCategory = categories.find((category) => category.id === form.categoryId);
  const progress = Math.round((step / 3) * 100);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) {
      return categories;
    }
    return categories.filter((category) => category.name.toLowerCase().includes(search));
  }, [categories, categorySearch]);

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

  const updateField = <K extends keyof RequirementForm>(field: K, value: RequirementForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const createRequirement = async () => {
    const payload = {
      title: form.title,
      categoryId: form.categoryId,
      quantity: Number(form.quantity),
      unit: form.unit,
      deliveryLocation: {
        city: form.city,
        state: form.state,
      },
      deliveryDeadline: form.deadline,
      budget: {
        min: Number(form.budgetMin),
        max: Number(form.budgetMax),
      },
      biddingMode: form.biddingMode,
      description: form.description,
      visibility: form.visibility,
    };

    try {
      setSubmitting(true);
      const created = await apiFetch("/api/requirements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/requirements/${created.id || created.requirement?.id}`);
    } catch (error: unknown) {
      const localId = `local-${Date.now()}`;
      const stored = JSON.parse(localStorage.getItem("procurelink:requirements") || "[]");
      localStorage.setItem(
        "procurelink:requirements",
        JSON.stringify([
          {
            id: localId,
            ...payload,
            category: selectedCategory?.name || "Uncategorized",
            closingAt: form.deadline,
            buyerVerified: true,
          },
          ...stored,
        ])
      );
      setMessage(getErrorMessage(error, "Saved locally because the requirements API is not available yet."));
      router.push(`/requirements/${localId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]">
              Requirement
            </Badge>
            <Badge variant="outline">Step {step} of 3</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            Post requirement
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-slate-200"
          onClick={() => router.push("/requirements")}
        >
          <ArrowLeft className="h-4 w-4" />
          Requirements
        </Button>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#2563EB] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <div className="grid border-b border-slate-200 sm:grid-cols-3">
          {[
            { value: 1, label: "Requirement" },
            { value: 2, label: "Budget & Rules" },
            { value: 3, label: "Preview" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={cn(
                "h-12 border-b px-3 text-sm font-semibold sm:border-b-0 sm:border-r last:sm:border-r-0",
                step === item.value ? "bg-blue-50 text-[#1E3A5F]" : "text-slate-500"
              )}
              onClick={() => setStep(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <CardContent className="space-y-6 px-5 py-6 sm:px-8">
          {step === 1 ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    className="h-11 border-slate-200"
                    placeholder="Industrial safety helmets"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Category</Label>
                    {loadingCategories ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading
                      </span>
                    ) : null}
                  </div>
                  <Input
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    className="h-10 border-slate-200"
                    placeholder="Search categories"
                  />
                  <div className="grid max-h-52 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-2">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className={cn(
                          "flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-sm font-medium",
                          form.categoryId === category.id
                            ? "bg-[#1E3A5F] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                        onClick={() => updateField("categoryId", category.id)}
                      >
                        {category.name}
                        {form.categoryId === category.id ? <Check className="h-4 w-4" /> : null}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      value={form.quantity}
                      inputMode="numeric"
                      onChange={(event) => updateField("quantity", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <select
                      value={form.unit}
                      onChange={(event) => updateField("unit", event.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/25"
                    >
                      {["pcs", "kg", "tons", "litres", "boxes", "sets"].map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Delivery city</Label>
                    <Input
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="Pune"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery state</Label>
                    <Input
                      value={form.state}
                      onChange={(event) => updateField("state", event.target.value)}
                      className="h-11 border-slate-200"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <Package className="h-6 w-6 text-[#2563EB]" />
                <h2 className="mt-3 text-base font-semibold text-slate-950">
                  Requirement basics
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use clear product names, measurable quantities, and a delivery location suppliers can quote against.
                </p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Delivery deadline</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(event) => updateField("deadline", event.target.value)}
                    className="h-11 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget min</Label>
                  <Input
                    value={form.budgetMin}
                    inputMode="numeric"
                    onChange={(event) => updateField("budgetMin", event.target.value)}
                    className="h-11 border-slate-200"
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget max</Label>
                  <Input
                    value={form.budgetMax}
                    inputMode="numeric"
                    onChange={(event) => updateField("budgetMax", event.target.value)}
                    className="h-11 border-slate-200"
                    placeholder="250000"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Card className="rounded-lg border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Bidding mode</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {[
                      { value: "SEALED", label: "Sealed Bid" },
                      { value: "OPEN", label: "Open Auction" },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        className={cn(
                          "flex h-12 items-center justify-between rounded-lg border px-4 text-sm font-semibold",
                          form.biddingMode === mode.value
                            ? "border-[#2563EB] bg-blue-50 text-[#1E3A5F]"
                            : "border-slate-200 text-slate-600"
                        )}
                        onClick={() => updateField("biddingMode", mode.value as RequirementForm["biddingMode"])}
                      >
                        {mode.label}
                        {form.biddingMode === mode.value ? <Check className="h-4 w-4" /> : null}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {[
                      { value: "ALL", label: "All Suppliers" },
                      { value: "VERIFIED", label: "Verified Only" },
                      { value: "PRIVATE", label: "Private" },
                    ].map((visibility) => (
                      <button
                        key={visibility.value}
                        type="button"
                        className={cn(
                          "flex h-12 items-center justify-between rounded-lg border px-4 text-sm font-semibold",
                          form.visibility === visibility.value
                            ? "border-[#2563EB] bg-blue-50 text-[#1E3A5F]"
                            : "border-slate-200 text-slate-600"
                        )}
                        onClick={() =>
                          updateField("visibility", visibility.value as RequirementForm["visibility"])
                        }
                      >
                        {visibility.label}
                        {form.visibility === visibility.value ? <Check className="h-4 w-4" /> : null}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="min-h-32 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/25"
                  placeholder="Add specifications, quality expectations, packaging, and delivery notes."
                />
              </div>

              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 hover:border-[#2563EB] hover:bg-blue-50">
                <FileUp className="h-5 w-5 text-[#2563EB]" />
                Spec file upload
                <Input type="file" className="hidden" />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {form.title || "Untitled requirement"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {form.description || "No description added."}
                    </p>
                  </div>
                  <Badge>{selectedCategory?.name || "Category"}</Badge>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <Package className="h-4 w-4 text-[#2563EB]" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {form.quantity || "0"} {form.unit}
                    </p>
                    <p className="text-xs text-slate-500">Quantity</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <MapPin className="h-4 w-4 text-[#2563EB]" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {[form.city, form.state].filter(Boolean).join(", ") || "Not set"}
                    </p>
                    <p className="text-xs text-slate-500">Delivery location</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {form.deadline || "Not set"}
                    </p>
                    <p className="text-xs text-slate-500">Deadline</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <IndianRupee className="h-4 w-4 text-[#2563EB]" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {currency(form.budgetMin)} - {currency(form.budgetMax)}
                    </p>
                    <p className="text-xs text-slate-500">Budget</p>
                  </div>
                </div>
              </div>

              <Card className="rounded-lg border-slate-200 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Bidding</span>
                    <span className="font-semibold text-slate-900">{form.biddingMode}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Visibility</span>
                    <span className="font-semibold text-slate-900">{form.visibility}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-slate-900">
                      {selectedCategory?.name || "Not selected"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {message ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </div>
          ) : null}

          <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row">
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
                onClick={() => setStep((current) => Math.min(3, current + 1))}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="h-10 gap-2 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                disabled={submitting}
                onClick={createRequirement}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Publish Requirement
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

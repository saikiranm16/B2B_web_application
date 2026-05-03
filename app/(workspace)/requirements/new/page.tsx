"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useMarketplaceSession } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_OPTIONS,
  INDIA_STATES,
  UNIT_OPTIONS,
  createRequirement,
  formatCurrency,
  type RequirementBidMode,
  type RequirementVisibility,
} from "@/lib/marketplace";

export default function NewRequirementPage() {
  const router = useRouter();
  const { profile } = useMarketplaceSession();
  const [step, setStep] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: CATEGORY_OPTIONS[0],
    description: "",
    quantity: "1000",
    unit: "kg",
    deliveryLocation: "",
    deliveryState: INDIA_STATES[0],
    deadline: "",
    budgetMin: "100000",
    budgetMax: "250000",
    budgetUndisclosed: false,
    bidMode: "SEALED_BID" as RequirementBidMode,
    visibility: "ALL_SUPPLIERS" as RequirementVisibility,
    specFileName: "",
  });

  const preview = useMemo(
    () => ({
      title: form.title || "Untitled requirement",
      category: form.category,
      description: form.description || "Requirement summary will appear here.",
      quantity: Number(form.quantity || 0),
      unit: form.unit,
      deliveryLocation: form.deliveryLocation || "Delivery location",
      deliveryState: form.deliveryState,
      deadline: form.deadline,
      budgetMin: form.budgetUndisclosed ? null : Number(form.budgetMin || 0),
      budgetMax: form.budgetUndisclosed ? null : Number(form.budgetMax || 0),
      budgetUndisclosed: form.budgetUndisclosed,
      bidMode: form.bidMode,
      visibility: form.visibility,
      specFileName: form.specFileName || "No spec selected",
    }),
    [form]
  );

  if (!profile) {
    return null;
  }

  if (profile.role !== "BUYER") {
    return (
      <Card className="border-white/80 bg-white/85 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-950">Buyer-only workflow</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Requirement posting is reserved for buyer accounts. Suppliers can use the main requirement feed to
          discover opportunities and submit bids.
        </p>
      </Card>
    );
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.title || !form.category || !form.description || !form.quantity) {
        return "Fill title, category, description, quantity, and unit first.";
      }
    }
    if (step === 2) {
      if (!form.deliveryLocation || !form.deliveryState || !form.deadline) {
        return "Delivery location, state, and closing deadline are required.";
      }
      if (!form.budgetUndisclosed && (!form.budgetMin || !form.budgetMax)) {
        return "Provide a budget range or switch to undisclosed.";
      }
    }
    return "";
  };

  const moveNext = () => {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 3));
  };

  const publish = async () => {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setPublishing(true);
      const requirement = createRequirement({
        title: form.title,
        category: form.category,
        description: form.description,
        quantity: Number(form.quantity || 0),
        unit: form.unit,
        deliveryLocation: form.deliveryLocation,
        deliveryState: form.deliveryState,
        deadline: form.deadline,
        budgetMin: form.budgetUndisclosed ? null : Number(form.budgetMin || 0),
        budgetMax: form.budgetUndisclosed ? null : Number(form.budgetMax || 0),
        budgetUndisclosed: form.budgetUndisclosed,
        bidMode: form.bidMode,
        visibility: form.visibility,
        specFileName: form.specFileName || "rfq-specs.pdf",
      });
      router.push(`/requirements/${requirement.id}`);
    } catch (nextError: any) {
      setError(nextError?.message || "Unable to publish requirement.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Badge className="bg-[#10213d] text-white hover:bg-[#10213d]">3-step composer</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Post a requirement</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Structured buyer workflow with preview before publishing. Spec uploads stay frontend-only and store
              the selected filename.
            </p>
          </div>
          <div className="min-w-[240px]">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Progress</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#60a5fa_100%)]" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
          {step === 1 ? (
            <div className="space-y-6">
              <SectionHeader title="Step 1" subtitle="Title, category, narrative, quantity, and unit." />
              <Field label="Requirement title">
                <Input className="h-11" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="min-h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Add demand context, scope, quality expectations, and delivery notes."
                />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Quantity">
                  <Input className="h-11" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
                </Field>
                <Field label="Unit">
                  <select
                    value={form.unit}
                    onChange={(event) => setForm({ ...form, unit: event.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <SectionHeader title="Step 2" subtitle="Delivery, deadline, budget, and bid mode." />
              <Field label="Delivery location">
                <Input className="h-11" value={form.deliveryLocation} onChange={(event) => setForm({ ...form, deliveryLocation: event.target.value })} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="State">
                  <select
                    value={form.deliveryState}
                    onChange={(event) => setForm({ ...form, deliveryState: event.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {INDIA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Bid closing deadline">
                  <Input className="h-11" type="datetime-local" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
                </Field>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.budgetUndisclosed}
                  onChange={(event) => setForm({ ...form, budgetUndisclosed: event.target.checked })}
                  className="size-4 rounded border-slate-300 text-[#2563EB]"
                />
                Keep budget undisclosed
              </label>
              {!form.budgetUndisclosed ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Budget min">
                    <Input className="h-11" type="number" value={form.budgetMin} onChange={(event) => setForm({ ...form, budgetMin: event.target.value })} />
                  </Field>
                  <Field label="Budget max">
                    <Input className="h-11" type="number" value={form.budgetMax} onChange={(event) => setForm({ ...form, budgetMax: event.target.value })} />
                  </Field>
                </div>
              ) : null}
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Bid mode">
                  <select
                    value={form.bidMode}
                    onChange={(event) => setForm({ ...form, bidMode: event.target.value as RequirementBidMode })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="SEALED_BID">Sealed Bid</option>
                    <option value="OPEN_ACTION">Open Action</option>
                    <option value="DIRECT_PROPOSAL">Direct Proposal</option>
                  </select>
                </Field>
                <Field label="Visibility">
                  <select
                    value={form.visibility}
                    onChange={(event) => setForm({ ...form, visibility: event.target.value as RequirementVisibility })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="ALL_SUPPLIERS">All Suppliers</option>
                    <option value="VERIFIED_ONLY">Verified Only</option>
                  </select>
                </Field>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <SectionHeader title="Step 3" subtitle="Add a spec filename and review before publish." />
              <label className="block rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-900">Spec upload placeholder</p>
                <p className="mt-2 text-sm text-slate-500">{form.specFileName || "No file selected"}</p>
                <input
                  type="file"
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                  onChange={(event) => setForm({ ...form, specFileName: event.target.files?.[0]?.name || "" })}
                />
              </label>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Preview notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This page stores the selected filename and publishes into the local marketplace data layer so the
                  new requirement appears immediately in the feed and detail page.
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || publishing}>
              Previous
            </Button>
            {step < 3 ? (
              <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={moveNext}>
                Continue
              </Button>
            ) : (
              <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={publish} disabled={publishing}>
                {publishing ? "Publishing..." : "Publish requirement"}
              </Button>
            )}
          </div>
        </Card>

        <Card className="h-fit border-white/80 bg-white/85 p-6 shadow-xl">
          <p className="text-sm font-semibold text-slate-900">Preview</p>
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-slate-900 text-white hover:bg-slate-900">{preview.category}</Badge>
              <Badge variant="outline">{preview.bidMode.replaceAll("_", " ")}</Badge>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{preview.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{preview.description}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <p>{preview.quantity.toLocaleString("en-IN")} {preview.unit}</p>
              <p>{preview.deliveryLocation}, {preview.deliveryState}</p>
              <p>
                {preview.budgetUndisclosed
                  ? "Undisclosed budget"
                  : `${formatCurrency(preview.budgetMin)} - ${formatCurrency(preview.budgetMax)}`}
              </p>
              <p>{preview.specFileName}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
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

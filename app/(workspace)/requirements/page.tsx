"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, MapPin, ShieldCheck } from "lucide-react";

import { useMarketplaceSession } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CATEGORY_OPTIONS,
  INDIA_STATES,
  formatCountdown,
  formatCurrency,
  formatRelativeTime,
  listRequirements,
} from "@/lib/marketplace";

const BID_MODE_OPTIONS = [
  { value: "", label: "All bid modes" },
  { value: "SEALED_BID", label: "Sealed bid" },
  { value: "OPEN_ACTION", label: "Open action" },
  { value: "DIRECT_PROPOSAL", label: "Direct proposal" },
];

export default function RequirementsPage() {
  const { profile } = useMarketplaceSession();
  const [visibleCount, setVisibleCount] = useState(6);
  const [filters, setFilters] = useState({
    category: "",
    verifiedOnly: false,
    bidMode: "",
    deliveryState: "",
    budgetMin: 0,
    budgetMax: 1000000,
  });

  const results = useMemo(() => listRequirements(filters), [filters, profile?.id]);

  if (!profile) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="h-fit border-white/80 bg-white/85 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
            <p className="mt-1 text-sm text-slate-500">Category tree, bid mode, state, and budget range.</p>
          </div>
          <Filter className="size-4 text-[#2563EB]" />
        </div>

        <div className="mt-5 space-y-5">
          <SelectField
            label="Category"
            value={filters.category}
            onChange={(value) => setFilters({ ...filters, category: value })}
            options={[{ value: "", label: "All categories" }, ...CATEGORY_OPTIONS.map((value) => ({ value, label: value }))]}
          />
          <SelectField
            label="Bid mode"
            value={filters.bidMode}
            onChange={(value) => setFilters({ ...filters, bidMode: value })}
            options={BID_MODE_OPTIONS}
          />
          <SelectField
            label="Delivery state"
            value={filters.deliveryState}
            onChange={(value) => setFilters({ ...filters, deliveryState: value })}
            options={[{ value: "", label: "Any state" }, ...INDIA_STATES.map((value) => ({ value, label: value }))]}
          />
          <div>
            <label className="text-sm font-semibold text-slate-700">Budget range</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="number"
                value={filters.budgetMin}
                onChange={(event) => setFilters({ ...filters, budgetMin: Number(event.target.value || 0) })}
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Min"
              />
              <input
                type="number"
                value={filters.budgetMax}
                onChange={(event) => setFilters({ ...filters, budgetMax: Number(event.target.value || 1000000) })}
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Max"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(event) => setFilters({ ...filters, verifiedOnly: event.target.checked })}
              className="size-4 rounded border-slate-300 text-[#2563EB]"
            />
            Verified buyers only
          </label>
          <Button
            variant="outline"
            className="w-full border-slate-200 bg-white"
            onClick={() =>
              setFilters({
                category: "",
                verifiedOnly: false,
                bidMode: "",
                deliveryState: "",
                budgetMin: 0,
                budgetMax: 1000000,
              })
            }
          >
            Reset filters
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {profile.role === "BUYER" ? "Your requirements" : "Supplier requirement feed"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {profile.role === "BUYER"
                  ? "Requirement cards with category badge, quantity, location, and bid countdown."
                  : "Supplier-visible feed with contact shield and buyer verification context."}
              </p>
            </div>
            {profile.role === "BUYER" ? (
              <Link href="/requirements/new">
                <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Post requirement</Button>
              </Link>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          {results.slice(0, visibleCount).map((requirement) => (
            <Link key={requirement.id} href={`/requirements/${requirement.id}`}>
              <Card className="border-white/80 bg-white/85 p-6 shadow-xl transition hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-slate-900 text-white hover:bg-slate-900">{requirement.category}</Badge>
                      <Badge variant="outline">{requirement.bidMode.replaceAll("_", " ")}</Badge>
                      {requirement.buyerVerified ? (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldCheck className="size-3" />
                          Verified buyer
                        </Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">{requirement.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{requirement.description}</p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Closing</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{formatCountdown(requirement.deadline)}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(requirement.deadline)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <Metric label="Quantity" value={`${requirement.quantity.toLocaleString("en-IN")} ${requirement.unit}`} />
                  <Metric
                    label="Budget"
                    value={
                      requirement.budgetUndisclosed
                        ? "Undisclosed"
                        : `${formatCurrency(requirement.budgetMin)} - ${formatCurrency(requirement.budgetMax)}`
                    }
                  />
                  <Metric label="Location" value={requirement.deliveryLocation} />
                  <Metric label="Bids" value={`${requirement.bidCount} received`} />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[#2563EB]" />
                    {requirement.deliveryState}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{requirement.buyerCompany}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(requirement.createdAt)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {visibleCount < results.length ? (
          <div className="flex justify-center">
            <Button variant="outline" className="border-slate-200 bg-white" onClick={() => setVisibleCount((count) => count + 4)}>
              Load more
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
      >
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

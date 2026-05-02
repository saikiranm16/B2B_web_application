"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Filter,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Requirement = {
  id: string;
  title: string;
  category: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  deliveryLocation: {
    city: string;
    state: string;
  };
  closingAt?: string;
  deliveryDeadline?: string;
  budget: {
    min: number;
    max: number;
  };
  biddingMode: "SEALED" | "OPEN";
  visibility: "ALL" | "VERIFIED" | "PRIVATE";
  buyerVerified: boolean;
  description?: string;
};

const fallbackRequirements: Requirement[] = [
  {
    id: "req-001",
    title: "Industrial safety helmets with ISI certification",
    category: "Safety Equipment",
    categoryId: "safety",
    quantity: 1200,
    unit: "pcs",
    deliveryLocation: { city: "Pune", state: "Maharashtra" },
    closingAt: "2026-05-18",
    budget: { min: 180000, max: 260000 },
    biddingMode: "SEALED",
    visibility: "VERIFIED",
    buyerVerified: true,
    description: "Ventilated helmets with adjustable harness and printed company logo.",
  },
  {
    id: "req-002",
    title: "Mild steel sheets for fabrication line",
    category: "Steel & Metals",
    categoryId: "steel",
    quantity: 18,
    unit: "tons",
    deliveryLocation: { city: "Rajkot", state: "Gujarat" },
    closingAt: "2026-05-11",
    budget: { min: 900000, max: 1120000 },
    biddingMode: "OPEN",
    visibility: "ALL",
    buyerVerified: true,
    description: "CRCA sheets in mixed gauges with mill test certificate.",
  },
  {
    id: "req-003",
    title: "Corrugated packaging boxes for electronics",
    category: "Packaging",
    categoryId: "packaging",
    quantity: 8000,
    unit: "boxes",
    deliveryLocation: { city: "Noida", state: "Uttar Pradesh" },
    closingAt: "2026-05-25",
    budget: { min: 240000, max: 310000 },
    biddingMode: "SEALED",
    visibility: "ALL",
    buyerVerified: false,
    description: "5-ply printed boxes with inserts and moisture protection.",
  },
];

const categoryTree = [
  {
    name: "Industrial",
    items: [
      { id: "steel", name: "Steel & Metals" },
      { id: "machinery", name: "Machinery" },
      { id: "electrical", name: "Electrical" },
    ],
  },
  {
    name: "Operations",
    items: [
      { id: "safety", name: "Safety Equipment" },
      { id: "packaging", name: "Packaging" },
      { id: "office", name: "Office Supplies" },
    ],
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function closingLabel(dateValue?: string) {
  if (!dateValue) {
    return "No deadline";
  }

  const today = new Date();
  const end = new Date(dateValue);
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diff)) {
    return dateValue;
  }

  if (diff < 0) {
    return "Closed";
  }

  if (diff === 0) {
    return "Closes today";
  }

  return `${diff} days left`;
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(fallbackRequirements);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    location: "",
    sealed: true,
    open: true,
    verifiedOnly: false,
    budgetMax: "1500000",
    closing: "all",
  });

  useEffect(() => {
    const loadRequirements = async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.location) params.set("location", filters.location);
      if (filters.verifiedOnly) params.set("verifiedOnly", "true");
      if (filters.budgetMax) params.set("budgetMax", filters.budgetMax);
      params.set(
        "biddingMode",
        [filters.sealed ? "SEALED" : "", filters.open ? "OPEN" : ""].filter(Boolean).join(",")
      );
      params.set("closing", filters.closing);

      try {
        setLoading(true);
        const data = await apiFetch(`/api/requirements?${params.toString()}`);
        const remote = Array.isArray(data) ? data : data.requirements;
        if (Array.isArray(remote)) {
          setRequirements(remote);
        }
      } catch {
        const local = JSON.parse(localStorage.getItem("procurelink:requirements") || "[]");
        setRequirements([...local, ...fallbackRequirements]);
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, [filters]);

  const filteredRequirements = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const location = filters.location.trim().toLowerCase();
    const maxBudget = Number(filters.budgetMax);
    const now = new Date();

    return requirements.filter((requirement) => {
      const matchesSearch =
        !search ||
        requirement.title.toLowerCase().includes(search) ||
        requirement.category.toLowerCase().includes(search);
      const matchesCategory = !filters.categoryId || requirement.categoryId === filters.categoryId;
      const place = `${requirement.deliveryLocation.city} ${requirement.deliveryLocation.state}`.toLowerCase();
      const matchesLocation = !location || place.includes(location);
      const matchesMode =
        (filters.sealed && requirement.biddingMode === "SEALED") ||
        (filters.open && requirement.biddingMode === "OPEN");
      const matchesVerified = !filters.verifiedOnly || requirement.buyerVerified;
      const matchesBudget = !maxBudget || requirement.budget.max <= maxBudget;
      const closingDate = new Date(requirement.closingAt || requirement.deliveryDeadline || "");
      const daysLeft = Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const matchesClosing =
        filters.closing === "all" ||
        (filters.closing === "week" && daysLeft >= 0 && daysLeft <= 7) ||
        (filters.closing === "month" && daysLeft >= 0 && daysLeft <= 30);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesMode &&
        matchesVerified &&
        matchesBudget &&
        matchesClosing
      );
    });
  }, [filters, requirements]);

  const visibleRequirements = filteredRequirements.slice(0, visibleCount);

  const updateFilter = <K extends keyof typeof filters>(field: K, value: (typeof filters)[K]) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setVisibleCount(6);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(14,29,44,0.08)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#16324f] text-white hover:bg-[#16324f]">Marketplace</Badge>
              <Badge variant="outline">{filteredRequirements.length} listings</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Requirement feed</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Browse demand with filters that keep category, location, deadline, and budget easy to compare.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-[#16324f] p-5 text-white">
            <p className="text-sm font-semibold text-blue-100">Feed summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Verified</p>
                <p className="mt-2 text-2xl font-bold">
                  {filteredRequirements.filter((item) => item.buyerVerified).length}
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Sealed</p>
                <p className="mt-2 text-2xl font-bold">
                  {filteredRequirements.filter((item) => item.biddingMode === "SEALED").length}
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Open</p>
                <p className="mt-2 text-2xl font-bold">
                  {filteredRequirements.filter((item) => item.biddingMode === "OPEN").length}
                </p>
              </div>
            </div>
            <Link href="/requirements/new">
              <Button className="mt-4 h-11 w-full rounded-full bg-white text-[#16324f] hover:bg-slate-100">
                <Plus className="h-4 w-4" />
                Post New Requirement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
            <CardContent className="space-y-5 px-5 py-5">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#1d72f3]" />
                <h2 className="font-semibold text-slate-950">Filters</h2>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                    className="h-11 rounded-2xl border-slate-200 bg-white pl-9"
                    placeholder="Title or category"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="space-y-2">
                  {categoryTree.map((group) => (
                    <details key={group.name} className="rounded-2xl border border-slate-200 bg-[#f8fbff]" open>
                      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700">
                        {group.name}
                        <ChevronDown className="h-4 w-4" />
                      </summary>
                      <div className="space-y-1 border-t border-slate-200 p-2">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={cn(
                              "w-full rounded-xl px-3 py-2 text-left text-sm",
                              filters.categoryId === item.id
                                ? "bg-blue-50 font-semibold text-[#16324f]"
                                : "text-slate-600 hover:bg-white"
                            )}
                            onClick={() =>
                              updateFilter("categoryId", filters.categoryId === item.id ? "" : item.id)
                            }
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={filters.location}
                  onChange={(event) => updateFilter("location", event.target.value)}
                  className="h-11 rounded-2xl border-slate-200 bg-white"
                  placeholder="City or state"
                />
              </div>

              <div className="space-y-3">
                <Label>Bidding mode</Label>
                <label className="flex items-center gap-2 rounded-2xl bg-[#f8fbff] px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1d72f3]"
                    checked={filters.sealed}
                    onChange={(event) => updateFilter("sealed", event.target.checked)}
                  />
                  Sealed bid
                </label>
                <label className="flex items-center gap-2 rounded-2xl bg-[#f8fbff] px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1d72f3]"
                    checked={filters.open}
                    onChange={(event) => updateFilter("open", event.target.checked)}
                  />
                  Open auction
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Budget ceiling</Label>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatCurrency(Number(filters.budgetMax))}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="50000"
                  value={filters.budgetMax}
                  onChange={(event) => updateFilter("budgetMax", event.target.value)}
                  className="w-full accent-[#1d72f3]"
                />
              </div>

              <div className="space-y-2">
                <Label>Closing window</Label>
                <select
                  value={filters.closing}
                  onChange={(event) => updateFilter("closing", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1d72f3] focus:ring-2 focus:ring-[#1d72f3]/20"
                >
                  <option value="all">Any time</option>
                  <option value="week">Next 7 days</option>
                  <option value="month">Next 30 days</option>
                </select>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[#f8fbff] px-3 py-3 text-sm font-medium text-slate-700">
                Verified buyers only
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#1d72f3]"
                  checked={filters.verifiedOnly}
                  onChange={(event) => updateFilter("verifiedOnly", event.target.checked)}
                />
              </label>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-[1.75rem] border border-white/80 bg-white/90 px-4 py-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <SlidersHorizontal className="h-4 w-4 text-[#1d72f3]" />
              Showing {visibleRequirements.length} of {filteredRequirements.length} opportunities
            </div>
            {loading ? (
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing feed
              </span>
            ) : null}
          </div>

          <div className="grid gap-4">
            {visibleRequirements.map((requirement) => (
              <Card key={requirement.id} className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
                <CardContent className="space-y-5 px-5 py-5">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{requirement.category}</Badge>
                        <Badge
                          className={cn(
                            requirement.biddingMode === "SEALED"
                              ? "bg-[#16324f] text-white hover:bg-[#16324f]"
                              : "bg-emerald-600 text-white hover:bg-emerald-600"
                          )}
                        >
                          {requirement.biddingMode === "SEALED" ? "Sealed bid" : "Open auction"}
                        </Badge>
                        {requirement.buyerVerified ? (
                          <Badge className="gap-1 bg-blue-50 text-[#16324f] hover:bg-blue-50">
                            <BadgeCheck className="h-3 w-3" />
                            Verified buyer
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="mt-3 text-xl font-bold text-slate-950">{requirement.title}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {requirement.description}
                      </p>
                    </div>
                    <Link href={`/requirements/${requirement.id}`}>
                      <Button variant="outline" className="h-10 rounded-full border-slate-200 bg-white px-4">
                        View details
                      </Button>
                    </Link>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl bg-[#f8fbff] p-4">
                      <Package className="h-4 w-4 text-[#1d72f3]" />
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {requirement.quantity} {requirement.unit}
                      </p>
                      <p className="text-xs text-slate-500">Quantity</p>
                    </div>
                    <div className="rounded-3xl bg-[#f8fbff] p-4">
                      <MapPin className="h-4 w-4 text-[#1d72f3]" />
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {requirement.deliveryLocation.city}, {requirement.deliveryLocation.state}
                      </p>
                      <p className="text-xs text-slate-500">Delivery</p>
                    </div>
                    <div className="rounded-3xl bg-[#f8fbff] p-4">
                      <CalendarClock className="h-4 w-4 text-[#1d72f3]" />
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {closingLabel(requirement.closingAt || requirement.deliveryDeadline)}
                      </p>
                      <p className="text-xs text-slate-500">Closing</p>
                    </div>
                    <div className="rounded-3xl bg-[#f8fbff] p-4">
                      <IndianRupee className="h-4 w-4 text-[#1d72f3]" />
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {formatCurrency(requirement.budget.min)} - {formatCurrency(requirement.budget.max)}
                      </p>
                      <p className="text-xs text-slate-500">Budget</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!visibleRequirements.length ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/90 px-6 py-12 text-center">
              <p className="font-semibold text-slate-900">No requirements found</p>
              <p className="mt-1 text-sm text-slate-500">Adjust your filters to uncover more opportunities.</p>
            </div>
          ) : null}

          {visibleCount < filteredRequirements.length ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-slate-200 bg-white px-5"
                onClick={() => setVisibleCount((current) => current + 6)}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

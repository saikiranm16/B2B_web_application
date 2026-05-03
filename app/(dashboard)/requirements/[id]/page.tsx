"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  IndianRupee,
  MapPin,
  Package,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type Requirement = {
  id: string;
  title: string;
  category?: string;
  quantity?: number;
  unit?: string;
  deliveryLocation?: {
    city?: string;
    state?: string;
  };
  closingAt?: string;
  deliveryDeadline?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  biddingMode?: string;
  visibility?: string;
  buyerVerified?: boolean;
  description?: string;
};

function formatCurrency(value?: number) {
  if (!value) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RequirementDetailPage() {
  const params = useParams<{ id: string }>();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequirement = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/requirements/${params.id}`);
        setRequirement(data.requirement || data);
      } catch {
        const local = JSON.parse(localStorage.getItem("procurelink:requirements") || "[]");
        const found = local.find((item: Requirement) => item.id === params.id);
        setRequirement(found || null);
      } finally {
        setLoading(false);
      }
    };

    loadRequirement();
  }, [params.id]);

  if (loading) {
    return (
      <div className="glass-panel rounded-[1.75rem] border border-white/70 px-5 py-4 text-sm text-slate-600 shadow-sm">
        Loading requirement...
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-dashed border-slate-300 bg-white/90 px-6 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-950">Requirement not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This record may still be waiting on backend storage, but the frontend fallback is ready.
        </p>
        <Link href="/requirements">
          <Button className="mt-5 rounded-full bg-[#1d72f3] px-5 text-white hover:bg-[#135fd1]">
            Back to requirements
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/requirements">
        <Button variant="outline" className="h-11 gap-2 rounded-full border-slate-200 bg-white px-5">
          <ArrowLeft className="h-4 w-4" />
          Back to requirements
        </Button>
      </Link>

      <Card className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{requirement.category || "Category"}</Badge>
            <Badge className="bg-[#16324f] text-white hover:bg-[#16324f]">
              {requirement.biddingMode || "SEALED"}
            </Badge>
            {requirement.buyerVerified ? (
              <Badge className="gap-1 bg-blue-50 text-[#16324f] hover:bg-blue-50">
                <BadgeCheck className="h-3 w-3" />
                Verified buyer
              </Badge>
            ) : null}
          </div>
          <CardTitle className="text-3xl">{requirement.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-5 py-5">
          <p className="text-sm leading-7 text-slate-600">
            {requirement.description || "No description added."}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-[#f8fbff] p-4">
              <Package className="h-4 w-4 text-[#1d72f3]" />
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {requirement.quantity || 0} {requirement.unit || "units"}
              </p>
              <p className="text-xs text-slate-500">Quantity</p>
            </div>
            <div className="rounded-3xl bg-[#f8fbff] p-4">
              <MapPin className="h-4 w-4 text-[#1d72f3]" />
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {[requirement.deliveryLocation?.city, requirement.deliveryLocation?.state]
                  .filter(Boolean)
                  .join(", ") || "Not set"}
              </p>
              <p className="text-xs text-slate-500">Delivery</p>
            </div>
            <div className="rounded-3xl bg-[#f8fbff] p-4">
              <CalendarClock className="h-4 w-4 text-[#1d72f3]" />
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {requirement.closingAt || requirement.deliveryDeadline || "Not set"}
              </p>
              <p className="text-xs text-slate-500">Closing</p>
            </div>
            <div className="rounded-3xl bg-[#f8fbff] p-4">
              <IndianRupee className="h-4 w-4 text-[#1d72f3]" />
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {formatCurrency(requirement.budget?.min)} - {formatCurrency(requirement.budget?.max)}
              </p>
              <p className="text-xs text-slate-500">Budget</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

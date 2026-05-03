"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Crown,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";

import { useMarketplaceSession } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatCountdown,
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  getDashboardMetrics,
} from "@/lib/marketplace";

export default function DashboardPage() {
  const { profile } = useMarketplaceSession();
  const [showUpgrade, setShowUpgrade] = useState(profile?.role === "SUPPLIER" && profile?.tier === "FREE");

  const metrics = useMemo(() => (profile ? getDashboardMetrics(profile) : null), [profile]);

  if (!profile || !metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {showUpgrade && metrics.upgradePrompt ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4">
          <Card className="w-full max-w-xl border-white/80 bg-white p-7 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Crown className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-slate-950">Upgrade to LIMIT</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  LIMIT suppliers appear in more buyer searches, unlock stronger tier comparison, and
                  get a more prominent visibility badge in the marketplace feed.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">FREE</p>
                    <p className="mt-1 text-xs text-slate-500">Basic bidding and standard listing exposure.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">LIMIT</p>
                    <p className="mt-1 text-xs text-blue-700">Higher prominence, improved trust framing, better CTA placement.</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => setShowUpgrade(false)}>
                    Maybe later
                  </Button>
                  <Link href="/upgrade">
                    <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                      Compare tiers
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <Card className="border-white/80 bg-[linear-gradient(135deg,#10213d_0%,#1d4b8f_72%,#4f8cf7_100%)] p-7 text-white shadow-xl ring-0">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <Badge className="bg-white/[0.14] text-white hover:bg-white/[0.14]">
                {profile.role === "BUYER" ? "Buyer workspace" : "Supplier workspace"}
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold">
                {profile.role === "BUYER"
                  ? "Keep requirements moving from post to award."
                  : "Track the opportunities worth quoting today."}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/[0.88]">
                {profile.role === "BUYER"
                  ? "Review active demand, respond faster to suppliers, and keep shortlist decisions visible across the team."
                  : "See open buyer demand, manage submissions, and maintain a stronger response cadence through the inbox."}
              </p>
            </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Completion</p>
              <p className="mt-2 text-3xl font-semibold">{profile.onboardingCompleted ? "Ready" : "In progress"}</p>
              <p className="mt-2 text-sm text-white/75">
                {profile.onboardingCompleted
                  ? "Your core profile steps are complete."
                  : "Finish onboarding to unlock the strongest marketplace presentation."}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {metrics.primaryStats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4">
                <p className="text-sm text-white/[0.72]">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-xs text-white/[0.58]">{stat.helper}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Quick actions</p>
              <p className="mt-1 text-xs text-slate-500">Pinned navigation for the next workflow step.</p>
            </div>
            <TrendingUp className="size-4 text-[#2563EB]" />
          </div>
          <div className="mt-5 space-y-3">
            {profile.role === "BUYER" ? (
              <>
                <ActionLink href="/requirements/new" label="Post new requirement" helper="Open the structured 3-step composer." />
                <ActionLink href="/requirements" label="Review active bids" helper="Inspect bid counts and move to shortlist." />
              </>
            ) : (
              <>
                <ActionLink href="/requirements" label="Browse open opportunities" helper="Jump into the supplier feed with filters." />
                <ActionLink href="/messages" label="Respond to buyer threads" helper="Stay on top of unread clarification requests." />
              </>
            )}
            <ActionLink href="/onboarding" label="Finish onboarding" helper="Improve trust signals and completion score." />
            <ActionLink href="/profile" label="Update company profile" helper="Keep contact and company data current." />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                {profile.role === "BUYER" ? "Live requirements" : "Opportunity pulse"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {profile.role === "BUYER"
                  ? "Status cards connected to the shared requirement store."
                  : "Countdowns and budgets stay visible from the supplier feed."}
              </p>
            </div>
            <Link href="/requirements">
              <Button variant="outline" className="border-slate-200 bg-white">
                Open feed
              </Button>
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {metrics.recentRequirements.map((requirement) => (
              <Link key={requirement.id} href={`/requirements/${requirement.id}`}>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-slate-900 text-white hover:bg-slate-900">{requirement.category}</Badge>
                        <Badge variant="outline">{requirement.bidMode.replaceAll("_", " ")}</Badge>
                        {requirement.buyerVerified ? <Badge variant="secondary">Verified buyer</Badge> : null}
                      </div>
                      <h4 className="mt-3 text-base font-semibold text-slate-950">{requirement.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{requirement.description}</p>
                    </div>
                    <ArrowRight className="mt-1 size-4 text-slate-400" />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                    <p>{requirement.quantity.toLocaleString("en-IN")} {requirement.unit}</p>
                    <p>{formatCurrency(requirement.budgetMax)}</p>
                    <p>{requirement.deliveryLocation}</p>
                    <p>{formatCountdown(requirement.deadline)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Recent bid activity</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {profile.role === "BUYER"
                    ? "Buyer-side bid tray summary."
                    : "Your latest submissions and status changes."}
                </p>
              </div>
              <BriefcaseBusiness className="size-4 text-[#2563EB]" />
            </div>
            <div className="mt-5 space-y-3">
              {metrics.recentBids.map((bid) => (
                <div key={bid.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{bid.supplierCompany}</p>
                    <Badge
                      variant={
                        bid.status === "AWARDED" ? "default" : bid.status === "REJECTED" ? "destructive" : "outline"
                      }
                    >
                      {bid.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <p>{formatCurrency(bid.price)}</p>
                    <p>{bid.deliveryDays} day delivery</p>
                    <p>{bid.paymentTerms}</p>
                    <p>{formatDateTime(bid.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Messages snapshot</h3>
                <p className="mt-1 text-sm text-slate-500">Unread counts, counterpart trust, and message freshness.</p>
              </div>
              <MessageSquareText className="size-4 text-[#2563EB]" />
            </div>
            <div className="mt-5 space-y-3">
              {metrics.inbox.map((thread) => (
                <Link key={thread.id} href="/messages">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{thread.counterpartName}</p>
                        {thread.counterpartVerified ? <BadgeCheck className="size-4 text-emerald-600" /> : null}
                      </div>
                      {thread.unreadCount > 0 ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{thread.unreadCount} new</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{thread.lastMessage}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatRelativeTime(thread.lastMessageAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ActionLink({ href, label, helper }: { href: string; label: string; helper: string }) {
  return (
    <Link href={href} className="block rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="mt-1 text-sm text-slate-500">{helper}</p>
        </div>
        <ArrowRight className="size-4 text-slate-400" />
      </div>
    </Link>
  );
}

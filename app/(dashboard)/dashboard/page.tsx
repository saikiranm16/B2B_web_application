import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardList,
  Eye,
  MessageSquare,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    label: "Requirements posted",
    value: "04",
    note: "2 in draft, 2 published",
    icon: ClipboardList,
  },
  {
    label: "Active bids",
    value: "12",
    note: "Across 3 live requirements",
    icon: BriefcaseBusiness,
  },
  {
    label: "Unread messages",
    value: "07",
    note: "Supplier follow-ups waiting",
    icon: MessageSquare,
  },
  {
    label: "Profile views",
    value: "28",
    note: "This week",
    icon: Eye,
  },
];

const quickLinks = [
  {
    title: "Post a requirement",
    href: "/requirements/new",
    description: "Create a structured sourcing request with delivery and budget rules.",
  },
  {
    title: "Browse requirements",
    href: "/requirements",
    description: "Review live demand, use filters, and inspect requirement cards.",
  },
  {
    title: "Complete your profile",
    href: "/profile",
    description: "Keep KYC, location, and company information procurement-ready.",
  },
];

const timeline = [
  { title: "Safety helmets RFQ published", meta: "15 suppliers can view this requirement", status: "Live" },
  { title: "Supplier profile reached 80% completeness", meta: "Add PAN and brochure for full trust signal", status: "Action" },
  { title: "Three new buyer responses in packaging", meta: "Review shortlist and next negotiation steps", status: "New" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(14,29,44,0.08)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#16324f] text-white hover:bg-[#16324f]">
                Procurement workspace
              </Badge>
              <Badge variant="outline">Today&apos;s snapshot</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              A clearer view of procurement activity.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This dashboard gives buyers and suppliers a clean starting point: what is live,
              what needs attention, and which action to take next.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/requirements/new">
                <Button className="h-11 gap-2 rounded-full bg-[#1d72f3] px-5 text-white hover:bg-[#135fd1]">
                  <Plus className="h-4 w-4" />
                  New Requirement
                </Button>
              </Link>
              <Link href="/requirements">
                <Button variant="outline" className="h-11 rounded-full border-slate-200 bg-white px-5">
                  Open Marketplace
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#16324f] p-5 text-white">
            <div className="flex items-center gap-2 text-blue-100">
              <Sparkles className="h-4 w-4" />
              Focus for the day
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-blue-100">Priority</p>
                <p className="mt-1 text-lg font-semibold">Review active supplier responses</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Readiness</p>
                  <p className="mt-2 text-2xl font-bold">84%</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Next step</p>
                  <p className="mt-2 text-sm font-semibold">Finish KYC documents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-[1.6rem] border-white/80 bg-white/90 shadow-sm">
              <CardContent className="flex items-start justify-between gap-4 px-5 py-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fb] text-[#16324f]">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5">
            {timeline.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-[#f8fbff] p-4"
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#1d72f3] shadow-sm">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.meta}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <UsersRound className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Activity widgets are ready for real backend data
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                The frontend keeps the structure in place so the app still feels usable while APIs catch up.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 py-5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-[#f8fbff] p-4 transition-colors hover:border-blue-100 hover:bg-blue-50/60"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-950">{link.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    {link.description}
                  </span>
                </span>
                <ArrowUpRight className="mt-0.5 h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

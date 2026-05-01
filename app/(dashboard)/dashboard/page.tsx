import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ClipboardList,
  Eye,
  MessageSquare,
  Plus,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Requirements Posted", value: "0", icon: ClipboardList },
  { label: "Active Bids", value: "0", icon: BriefcaseBusiness },
  { label: "Messages", value: "0", icon: MessageSquare },
  { label: "Profile Views", value: "0", icon: Eye },
];

const quickLinks = [
  {
    title: "Post a Requirement",
    href: "/requirements/new",
    description: "Create a structured sourcing request.",
  },
  {
    title: "Browse Requirements",
    href: "/requirements",
    description: "Find open opportunities and track market demand.",
  },
  {
    title: "Update Profile",
    href: "/profile",
    description: "Keep company and KYC details current.",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]">
              Procurement workspace
            </Badge>
            <Badge variant="outline">Day 2</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Track requirements, bids, supplier connections, and profile activity from one place.
          </p>
        </div>
        <Link href="/requirements/new">
          <Button className="h-10 gap-2 bg-[#2563EB] px-4 text-white hover:bg-[#1d4ed8]">
            <Plus className="h-4 w-4" />
            New Requirement
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-8">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <UsersRound className="h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                No recent activity yet
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                New requirements, bids, connections, and profile views will appear here.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 py-5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:border-[#2563EB] hover:bg-blue-50/50"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-950">
                    {link.title}
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
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

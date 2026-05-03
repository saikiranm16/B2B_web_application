import { BadgeCheck, BriefcaseBusiness, Clock3, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bidCards = [
  {
    title: "Safety helmets RFQ",
    meta: "3 supplier responses pending review",
    status: "Reviewing",
  },
  {
    title: "Steel sheet sourcing",
    meta: "Open auction scheduled to close this week",
    status: "Live",
  },
  {
    title: "Packaging requirement",
    meta: "Awaiting more verified supplier participation",
    status: "Pending",
  },
];

export default function BidsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(14,29,44,0.08)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#16324f] text-white hover:bg-[#16324f]">Bids</Badge>
              <Badge variant="outline">Frontend placeholder</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Bid management space</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This route now has a polished frontend state so navigation no longer leads to a dead end while backend bid workflows are added.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-[#16324f] p-5 text-white">
            <p className="text-sm font-semibold text-blue-100">What will live here</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <BriefcaseBusiness className="h-4 w-4 text-blue-100" />
                <p className="mt-2 text-sm font-semibold">Supplier quotes</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <Filter className="h-4 w-4 text-blue-100" />
                <p className="mt-2 text-sm font-semibold">Bid filters</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <Clock3 className="h-4 w-4 text-blue-100" />
                <p className="mt-2 text-sm font-semibold">Closing timelines</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {bidCards.map((card) => (
          <Card key={card.title} className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BadgeCheck className="h-5 w-5 text-[#1d72f3]" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-5">
              <p className="text-sm leading-6 text-slate-600">{card.meta}</p>
              <Badge variant="outline" className="mt-4">
                {card.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

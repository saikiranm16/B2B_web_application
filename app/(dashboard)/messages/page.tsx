import { Inbox, MessageSquare, Send, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const messageCards = [
  {
    title: "Supplier follow-up",
    body: "Confirm delivery expectations for the safety equipment requirement before shortlist approval.",
  },
  {
    title: "Buyer clarification",
    body: "Request updated packaging dimensions and printed branding notes from the procurement team.",
  },
  {
    title: "System summary",
    body: "Unread conversations and notifications will plug into this UI once message APIs are connected.",
  },
];

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(14,29,44,0.08)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#16324f] text-white hover:bg-[#16324f]">Messages</Badge>
              <Badge variant="outline">UI-ready inbox</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Conversation workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              The navigation route now opens into a stable frontend page instead of a missing route, keeping the procurement experience coherent.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-[#16324f] p-5 text-white">
            <p className="text-sm font-semibold text-blue-100">Inbox layout preview</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <Inbox className="h-4 w-4 text-blue-100" />
                <p className="mt-2 text-sm font-semibold">Inbox</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <UsersRound className="h-4 w-4 text-blue-100" />
                <p className="mt-2 text-sm font-semibold">Participants</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <Send className="h-4 w-4 text-blue-100" />
                <p className="mt-2 text-sm font-semibold">Replies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {messageCards.map((card) => (
          <Card key={card.title} className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-[#1d72f3]" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-5">
              <p className="text-sm leading-6 text-slate-600">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

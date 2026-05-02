import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChartNoAxesColumn,
  CheckCircle2,
  Files,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const highlights = [
  { label: "Verified suppliers", value: "1.2K+" },
  { label: "Buyer teams onboarded", value: "340+" },
  { label: "Average sourcing cycle saved", value: "38%" },
];

const featureCards = [
  {
    icon: Files,
    title: "Structured requirement posting",
    body: "Create clear RFQs with quantity, delivery, budget, and bidding rules in a guided flow.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer and supplier trust signals",
    body: "Surface KYC status, account tier, and marketplace visibility without making the UI overwhelming.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Procurement progress at a glance",
    body: "Use dashboards, filters, and summaries that help teams understand what needs action next.",
  },
];

const rolePanels = [
  {
    title: "For Buyers",
    href: "/signup?role=BUYER",
    points: [
      "Post requirements with measurable delivery and budget details.",
      "Compare open auction and sealed bid workflows in one place.",
      "Track supplier responses, shortlist activity, and profile readiness.",
    ],
  },
  {
    title: "For Suppliers",
    href: "/signup?role=SUPPLIER",
    points: [
      "Discover verified demand by category, location, and deadline.",
      "Present capabilities with onboarding details and category reach.",
      "Respond faster with a simpler, low-friction workspace.",
    ],
  },
];

const steps = [
  {
    title: "Set up the account",
    text: "Register as buyer or supplier and complete the role-specific onboarding flow.",
  },
  {
    title: "Post or discover demand",
    text: "Buyers create requirements while suppliers browse filtered marketplace opportunities.",
  },
  {
    title: "Manage procurement visibly",
    text: "Track key activity, profile completion, and next actions from the dashboard.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen text-slate-950">
      <div className="app-grid min-h-screen">
        <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16324f] text-sm font-bold text-white shadow-lg shadow-slate-300/40">
                P
              </span>
              <div>
                <p className="text-lg font-bold text-[#16324f]">ProcureLink</p>
                <p className="text-xs text-slate-500">B2B procurement marketplace</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="outline" className="h-10 rounded-full border-slate-200 px-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-10 rounded-full bg-[#1d72f3] px-5 text-white hover:bg-[#135fd1]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-2 text-sm font-medium text-[#16324f] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#1d72f3]" />
                  Frontend-ready workflow for buyers and suppliers
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-[#102033] sm:text-6xl">
                    A calmer, clearer way to run B2B procurement.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    ProcureLink gives buyers and suppliers a clean marketplace experience with
                    onboarding, requirements, and dashboards that are easy to understand from the first click.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup?role=BUYER">
                    <Button className="h-12 rounded-full bg-[#16324f] px-6 text-white hover:bg-[#0d2236]">
                      Start as Buyer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup?role=SUPPLIER">
                    <Button variant="outline" className="h-12 rounded-full border-slate-200 bg-white px-6">
                      Explore as Supplier
                    </Button>
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div
                      key={item.label}
                      className="glass-panel rounded-3xl border border-white/70 p-5 shadow-[0_18px_50px_rgba(14,29,44,0.08)]"
                    >
                      <p className="text-2xl font-bold text-[#16324f]">{item.value}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-10 hidden h-28 w-28 rounded-full bg-[#1d72f3]/12 blur-2xl lg:block" />
                <div className="absolute -right-4 bottom-16 hidden h-36 w-36 rounded-full bg-[#16324f]/10 blur-3xl lg:block" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_30px_90px_rgba(14,29,44,0.16)] backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-sm font-semibold text-[#16324f]">Marketplace overview</p>
                      <p className="text-xs text-slate-500">Designed for low-friction sourcing</p>
                    </div>
                    <span className="rounded-full bg-[#e8f0fb] px-3 py-1 text-xs font-semibold text-[#16324f]">
                      Live UI
                    </span>
                  </div>

                  <div className="grid gap-4 pt-5">
                    <div className="rounded-3xl bg-[#16324f] p-5 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-blue-100">Buyer workspace</p>
                          <p className="mt-2 text-2xl font-bold">4-step requirement funnel</p>
                        </div>
                        <Building2 className="h-7 w-7 text-blue-100" />
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {["Onboarding", "Post Requirement", "Track Bids"].map((item) => (
                          <div key={item} className="rounded-2xl bg-white/10 px-3 py-3 text-sm">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-2 text-[#16324f]">
                          <BadgeCheck className="h-4 w-4 text-[#1d72f3]" />
                          <p className="text-sm font-semibold">Trust-first profiles</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          Verified-only controls, profile completion, and onboarding progress keep the interface informative.
                        </p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-2 text-[#16324f]">
                          <Globe2 className="h-4 w-4 text-[#1d72f3]" />
                          <p className="text-sm font-semibold">Readable marketplace filters</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          Category, location, bidding mode, and budget filters are organized for fast scanning.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5">
                      <div className="flex flex-wrap gap-3">
                        {["Buyer onboarding", "Supplier categories", "Requirement preview", "Responsive sidebar"].map(
                          (label) => (
                            <span
                              key={label}
                              className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-[#16324f]"
                            >
                              {label}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1d72f3]">
                  Core experience
                </p>
                <h2 className="mt-3 text-3xl font-bold text-[#102033] sm:text-4xl">
                  Frontend flows that feel structured instead of stressful.
                </h2>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(14,29,44,0.08)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fb] text-[#16324f]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-[#102033]">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{feature.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
              {rolePanels.map((panel) => (
                <div
                  key={panel.title}
                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-[0_20px_70px_rgba(14,29,44,0.08)]"
                >
                  <div className="border-b border-slate-100 bg-[#f8fbff] px-6 py-5">
                    <h3 className="text-2xl font-bold text-[#16324f]">{panel.title}</h3>
                  </div>
                  <div className="space-y-4 px-6 py-6">
                    {panel.points.map((point) => (
                      <div key={point} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1d72f3]" />
                        <p className="text-sm leading-6 text-slate-600">{point}</p>
                      </div>
                    ))}
                    <Link href={panel.href}>
                      <Button className="mt-3 rounded-full bg-[#16324f] px-5 text-white hover:bg-[#0d2236]">
                        Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-[#16324f] px-6 py-8 text-white shadow-[0_20px_70px_rgba(14,29,44,0.16)] sm:px-8 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                    How it works
                  </p>
                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                    Move from signup to sourcing without confusion.
                  </h2>
                </div>

                <div className="grid gap-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4"
                    >
                      <p className="text-sm font-semibold text-blue-100">Step {index + 1}</p>
                      <p className="mt-1 text-lg font-semibold">{step.title}</p>
                      <p className="mt-2 text-sm leading-6 text-blue-50/90">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/60 bg-white/75 px-4 py-6 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>ProcureLink frontend for buyer and supplier procurement journeys.</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-[#16324f]">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#16324f]">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

const sections = [
  {
    title: "Marketplace usage",
    body: "Buyers and suppliers should provide accurate profile, category, and requirement details so the procurement workflow remains understandable and useful.",
  },
  {
    title: "UI placeholders",
    body: "Some routes are currently frontend-complete while backend integrations are still catching up. The interface is designed to degrade gracefully instead of crashing.",
  },
  {
    title: "Responsible access",
    body: "Use the platform for legitimate B2B sourcing and communication activities, and avoid posting misleading procurement information.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur hover:text-[#16324f]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(14,29,44,0.08)]">
          <div className="border-b border-slate-100 bg-[#16324f] px-6 py-8 text-white sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <FileText className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-3xl font-bold">Terms of use</h1>
                <p className="mt-1 text-sm text-blue-100">Project-level guidance for the current frontend</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6 sm:px-8">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fbff] p-5">
                <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

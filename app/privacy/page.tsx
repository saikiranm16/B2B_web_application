import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Information we display",
    body: "ProcureLink surfaces account, profile, and procurement details so buyers and suppliers can understand each other quickly inside the workspace.",
  },
  {
    title: "Frontend-only states",
    body: "Some pages currently show saved local fallback data when backend APIs are unavailable. That fallback stays in the browser until a full backend flow is connected.",
  },
  {
    title: "User control",
    body: "You can review account details, onboarding inputs, and requirement drafts through the profile and dashboard experience.",
  },
];

export default function PrivacyPage() {
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
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-3xl font-bold">Privacy</h1>
                <p className="mt-1 text-sm text-blue-100">Frontend-friendly overview for this project</p>
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

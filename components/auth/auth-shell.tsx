import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  asideTitle: string;
  asideDescription: string;
  points: string[];
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  asideTitle,
  asideDescription,
  points,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur hover:text-[#16324f]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_480px] lg:items-center">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[#16324f] p-6 text-white shadow-[0_24px_80px_rgba(14,29,44,0.16)] sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <ShieldCheck className="h-4 w-4" />
              {eyebrow}
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-blue-50/90">{description}</p>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-blue-100">{asideTitle}</p>
              <p className="mt-2 text-sm leading-6 text-blue-50/90">{asideDescription}</p>
            </div>

            <div className="mt-6 space-y-3">
              {points.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-100" />
                  <p className="text-sm leading-6 text-white">{point}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] border border-white/80 p-6 shadow-[0_24px_80px_rgba(14,29,44,0.08)] sm:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16324f] text-base font-bold text-white">
                  P
                </span>
                <div>
                  <p className="text-lg font-bold text-[#16324f]">ProcureLink</p>
                  <p className="text-sm text-slate-500">Buyer and supplier workspace</p>
                </div>
              </div>
            </div>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}

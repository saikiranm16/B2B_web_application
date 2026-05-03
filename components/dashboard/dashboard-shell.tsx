"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TokenUser = {
  id?: string;
  email?: string;
  role?: "BUYER" | "SUPPLIER";
  tier?: string;
  kycStatus?: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Overview" },
  { href: "/requirements", label: "Requirements", icon: ClipboardList, hint: "RFQs and feed" },
  { href: "/bids", label: "Bids", icon: BriefcaseBusiness, hint: "Responses" },
  { href: "/messages", label: "Messages", icon: MessageSquare, hint: "Inbox" },
  { href: "/profile", label: "Profile", icon: UserRound, hint: "Company details" },
];

function decodeToken(token: string): TokenUser | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<TokenUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/signin");
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded) {
        localStorage.removeItem("token");
        router.replace("/signin");
        return;
      }

      setUser(decoded);
      setCheckingAuth(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const displayName = useMemo(() => {
    const emailName = user?.email?.split("@")[0];
    if (!emailName) {
      return "ProcureLink user";
    }

    return emailName
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [user?.email]);

  const workspaceLabel = user?.role === "SUPPLIER" ? "Supplier workspace" : "Buyer workspace";
  const tierLabel = user?.tier || "FREE";
  const kycLabel = user?.kycStatus || "PENDING";

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-3xl border border-white/70 px-5 py-4 text-sm font-medium text-slate-700 shadow-[0_18px_50px_rgba(14,29,44,0.08)]">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 border-r border-white/70 bg-[#f8fbff]/95 p-4 shadow-[0_20px_70px_rgba(14,29,44,0.12)] backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2 pb-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16324f] text-sm font-bold text-white shadow-lg shadow-slate-300/40">
                P
              </span>
              <div>
                <p className="text-lg font-bold text-[#16324f]">ProcureLink</p>
                <p className="text-xs text-slate-500">{workspaceLabel}</p>
              </div>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#16324f]">{displayName}</p>
                <p className="mt-1 text-xs text-slate-500">{user?.email || "No email found"}</p>
              </div>
              <div className="rounded-full bg-[#e8f0fb] px-3 py-1 text-xs font-semibold text-[#16324f]">
                {user?.role || "USER"}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tier</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{tierLabel}</p>
              </div>
              <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">KYC</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{kycLabel}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#16324f] px-3 py-3 text-sm text-white">
              <Sparkles className="h-4 w-4 text-blue-100" />
              Frontend workspace is ready even when APIs are partial.
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-[1.35rem] border px-4 py-3 transition-all",
                    active
                      ? "border-[#16324f] bg-[#16324f] text-white shadow-lg shadow-slate-300/30"
                      : "border-transparent bg-white/70 text-slate-600 hover:border-slate-200 hover:bg-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl",
                        active ? "bg-white/12" : "bg-[#f0f5fb] text-[#16324f]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("block text-xs", active ? "text-blue-100" : "text-slate-400")}>
                        {item.hint}
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#16324f]">
              <ShieldCheck className="h-4 w-4 text-[#1d72f3]" />
              Workspace controls
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use profile and onboarding flows to keep company details clear before procurement activity grows.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 h-10 w-full justify-start gap-2 rounded-2xl border-slate-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-slate-200 bg-white lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Workspace
                </p>
                <p className="text-lg font-semibold text-slate-950">{workspaceLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="border-slate-200 bg-white">
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/profile">
                <Button type="button" variant="outline" className="h-10 gap-2 rounded-full border-slate-200 bg-white px-4">
                  <UserRound className="h-4 w-4" />
                  {displayName}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

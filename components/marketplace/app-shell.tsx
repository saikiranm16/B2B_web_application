"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Bell,
  BriefcaseBusiness,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  calculateProfileCompletion,
  clearSession,
  getCurrentProfile,
  type MarketplaceProfile,
} from "@/lib/marketplace";

type SessionContextValue = {
  profile: MarketplaceProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => void;
  profileCompletion: number;
};

const MarketplaceSessionContext = createContext<SessionContextValue | null>(null);

const LABELS: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Command Center",
    subtitle: "Live marketplace overview with the actions that matter next.",
  },
  "/onboarding": {
    title: "Onboarding",
    subtitle: "Complete your business profile in three guided steps.",
  },
  "/requirements": {
    title: "Requirements",
    subtitle: "Browse, filter, and manage active procurement demand.",
  },
  "/requirements/new": {
    title: "Post Requirement",
    subtitle: "Create a structured requirement with preview before publish.",
  },
  "/messages": {
    title: "Messages",
    subtitle: "Requirement-linked conversations with inbox polling.",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Maintain company information, verification, and reach.",
  },
  "/upgrade": {
    title: "Upgrade",
    subtitle: "Compare supplier tiers and unlock more visibility.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Lightweight account preferences and launch toggles.",
  },
};

function getTitleConfig(pathname: string) {
  if (pathname.startsWith("/requirements/") && pathname !== "/requirements/new") {
    return {
      title: "Requirement Detail",
      subtitle: "Inspect requirement data, bids, and buyer or supplier actions.",
    };
  }
  return LABELS[pathname] ?? LABELS["/dashboard"];
}

export function useMarketplaceSession() {
  const value = useContext(MarketplaceSessionContext);
  if (!value) {
    throw new Error("useMarketplaceSession must be used inside AppShell");
  }
  return value;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadProfile = async () => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/signin");
      return;
    }

    try {
      setLoading(true);
      const nextProfile = await getCurrentProfile();
      setProfile(nextProfile);
    } catch {
      clearSession();
      router.replace("/signin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = useMemo(() => {
    const items = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/onboarding", label: "Onboarding", icon: CircleUserRound },
      { href: "/requirements", label: "Requirements", icon: BriefcaseBusiness },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/profile", label: "Profile", icon: FileText },
      { href: "/settings", label: "Settings", icon: Bell },
    ];

    if (profile?.role === "BUYER") {
      return items.filter((item) => item.href !== "/upgrade");
    }

    return [...items.slice(0, 5), { href: "/upgrade", label: "Upgrade", icon: Sparkles }, items[5]];
  }, [profile?.role]);

  const signOut = () => {
    clearSession();
    router.replace("/signin");
  };

  const contextValue = useMemo(
    () => ({
      profile,
      loading,
      refreshProfile: loadProfile,
      signOut,
      profileCompletion: profile ? calculateProfileCompletion(profile) : 0,
    }),
    [profile, loading]
  );

  const title = getTitleConfig(pathname);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] p-6">
        <div className="mx-auto grid min-h-[85vh] max-w-7xl gap-6 lg:grid-cols-[272px_minmax(0,1fr)]">
          <Card className="hidden min-h-full border-white/70 bg-white/80 p-5 shadow-xl lg:flex lg:flex-col" />
          <div className="space-y-6">
            <Card className="border-white/70 bg-white/80 p-6 shadow-xl">
              <div className="h-8 w-48 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-80 animate-pulse rounded-full bg-slate-100" />
            </Card>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-white/70 bg-white/80 p-6 shadow-xl">
                  <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-4 h-9 w-20 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-4 h-3 w-32 animate-pulse rounded-full bg-slate-100" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MarketplaceSessionContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] text-slate-900">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[272px_minmax(0,1fr)] lg:px-6">
          <aside
            className={`fixed inset-y-4 left-4 z-50 w-[272px] rounded-[28px] border border-white/80 bg-[#10213d] p-5 text-white shadow-2xl transition-transform duration-200 lg:static lg:translate-x-0 ${
              mobileOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.14] text-lg font-semibold">
                  P
                </div>
                <div>
                  <p className="text-lg font-semibold">ProcureLink</p>
                  <p className="text-xs text-white/65">B2B procurement workspace</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 lg:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Signed in</p>
              <p className="mt-2 text-lg font-semibold">{profile.fullName || profile.email}</p>
              <p className="mt-1 text-sm text-white/65">{profile.companyName || "Profile setup pending"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-white text-[#10213d] hover:bg-white">{profile.role}</Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {profile.tier}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {contextValue.profileCompletion}% complete
                </Badge>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || (item.href === "/requirements" && pathname.startsWith("/requirements"));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active ? "bg-white text-[#10213d] shadow-lg" : "text-white/[0.78] hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6">
              <Card className="border-white/10 bg-white/[0.08] p-4 text-white ring-0">
                <p className="text-sm font-semibold">Protected route workspace</p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  No valid token in local storage redirects back to sign in automatically.
                </p>
              </Card>
              <Button
                variant="ghost"
                className="mt-4 w-full justify-start text-white hover:bg-white/10 hover:text-white"
                onClick={signOut}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </Button>
            </div>
          </aside>

          <main className="min-w-0 pb-6">
            <header className="sticky top-4 z-30 mb-6 rounded-[28px] border border-white/80 bg-white/80 px-5 py-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="mt-0.5 lg:hidden"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="size-4" />
                  </Button>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Workspace
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-950">{title.title}</h1>
                    <p className="mt-1 text-sm text-slate-600">{title.subtitle}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                    {profile.city || "City pending"}, {profile.state || "state pending"}
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" className="border-slate-200 bg-white">
                      Update profile
                    </Button>
                  </Link>
                </div>
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>
    </MarketplaceSessionContext.Provider>
  );
}

import type { ReactNode } from "react";

import { AppShell } from "@/components/marketplace/app-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

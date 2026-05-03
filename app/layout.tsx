import "./globals.css";
import { Inter, Geist } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "ProcureLink",
  description: "B2B procurement marketplace for buyers and suppliers.",
};

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, inter.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

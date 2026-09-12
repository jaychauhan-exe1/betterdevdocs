import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ui } from "@clerk/ui";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better DevDocs - Developer Documentation & Study Guide",
  description: "Minimal monochrome study guide for software developers",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-icon.png",
  },
};

import { SyncProgressProvider } from "@/components/SyncProgressProvider";
import { TopicsProvider } from "@/components/TopicsProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
        <ClerkProvider
          ui={ui}
          appearance={{
            variables: {
              fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              colorPrimary: "var(--foreground)",
              colorBackground: "var(--clerk-bg-dark)",
              borderRadius: "0.75rem",
            },
            elements: {
              // Hide footers & badging
              footer: "hidden",
              footerAction: "hidden",
              devModeBadge: "hidden",
              userButtonPopoverFooter: "hidden",
              navbarFooter: "hidden",

              // Custom monochrome element styling (Theme Variable Driven)
              card: "border border-border shadow-2xl rounded-2xl bg-card text-foreground p-6",
              cardBox: "border border-border shadow-2xl rounded-2xl bg-card text-foreground",
              headerTitle: "text-foreground font-bold tracking-tight text-lg",
              headerSubtitle: "text-muted-foreground text-xs font-normal",
              socialButtonsBlockButton: "bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-lg",
              formButtonPrimary: "bg-foreground hover:bg-foreground/90 text-background font-semibold text-xs tracking-wide uppercase py-2.5 shadow-none rounded-lg",
              formFieldLabel: "text-muted-foreground text-[11px] font-medium uppercase tracking-wider",
              formFieldInput: "bg-background border border-border text-foreground text-xs rounded-lg",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-[10px] uppercase tracking-widest",
              userButtonPopoverCard: "bg-card border border-border rounded-xl shadow-2xl p-2",
              userPreviewMainIdentifier: "text-foreground font-semibold text-sm",
              userPreviewSecondaryIdentifier: "text-muted-foreground text-xs",
            },
          }}
        >
          <TopicsProvider>
            <SyncProgressProvider>{children}</SyncProgressProvider>
          </TopicsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
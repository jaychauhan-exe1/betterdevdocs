import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
          appearance={{
            variables: {
              fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              colorPrimary: "#ffffff",
              colorBackground: "#050505",
              borderRadius: "0.75rem",
            },
            elements: {
              // Hide footers & badging
              footer: "hidden",
              footerAction: "hidden",
              devModeBadge: "hidden",
              userButtonPopoverFooter: "hidden",
              navbarFooter: "hidden",

              // Custom monochrome element styling
              card: "border border-zinc-800 shadow-2xl rounded-2xl bg-zinc-950 text-white p-6",
              cardBox: "border border-zinc-800 shadow-2xl rounded-2xl bg-zinc-950 text-white",
              headerTitle: "text-white font-bold tracking-tight text-lg",
              headerSubtitle: "text-zinc-400 text-xs font-normal",
              socialButtonsBlockButton: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-lg",
              formButtonPrimary: "bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wide uppercase py-2.5 shadow-none rounded-lg",
              formFieldLabel: "text-zinc-300 text-[11px] font-medium uppercase tracking-wider",
              formFieldInput: "bg-black border border-zinc-800 text-white text-xs rounded-lg",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-400 text-[10px] uppercase tracking-widest",
              userButtonPopoverCard: "bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2",
              userPreviewMainIdentifier: "text-white font-semibold text-sm",
              userPreviewSecondaryIdentifier: "text-zinc-300 text-xs",
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
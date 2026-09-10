import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-foreground p-4 overflow-hidden">
      {/* Background subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_70%)] pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to DevDocs</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="z-10 w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center text-foreground shadow-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back to DevDocs</h1>
          <p className="text-xs text-muted-foreground">Sign in to track your mastery & saved progress</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              footer: "hidden",
              footerAction: "hidden",
              devModeBadge: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}

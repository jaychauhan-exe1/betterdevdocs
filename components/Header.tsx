"use client";

import React, { useState, useEffect } from "react";
import { TOPICS } from "@/data/topics";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, RotateCcw, CheckCircle2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";

function formatStarCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export default function Header() {
  const activeTopic = useStudyStore((state) => state.getActiveTopic());
  const completedCount = useStudyStore((state) => state.completedTopics.length);
  const toggleSidebar = useStudyStore((state) => state.toggleSidebar);
  const resetProgress = useStudyStore((state) => state.resetProgress);

  const [starCount, setStarCount] = useState<string | null>(null);

  const topics = useStudyStore((state) => state.topics);
  const totalCount = topics.length;

  useEffect(() => {
    fetch("/api/github-stars")
      .then((res) => {
        if (!res.ok) throw new Error("Internal route error");
        return res.json();
      })
      .then((data) => {
        if (typeof data?.stars === "number") {
          setStarCount(formatStarCount(data.stars));
        }
      })
      .catch(() => {
        // Fallback directly to ungh.cc API if local route fails
        fetch("https://ungh.cc/repos/jaychauhan-exe1/devdocs")
          .then((res) => res.json())
          .then((data) => {
            if (typeof data?.repo?.stars === "number") {
              setStarCount(formatStarCount(data.repo.stars));
            }
          })
          .catch((err) => {
            console.warn("Failed to fetch live GitHub stars", err);
          });
      });
  }, []);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all topic completion progress?")) {
      resetProgress();
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/90 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between font-normal">
      <div className="flex items-center gap-3 font-normal">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 text-xs font-normal">
          <Badge variant="secondary" className="font-medium uppercase text-[10px]">
            {activeTopic.category}
          </Badge>
          <span className="text-muted-foreground font-normal">/</span>
          <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
            {activeTopic.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 font-normal">
        {/* Dynamic GitHub Star Badge */}
        <a
          href="https://github.com/jaychauhan-exe1/devdocs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 active:scale-95"
          title="Star on GitHub"
        >
          <FaGithub className="w-4 h-4 text-foreground" />
          <span className="text-xs font-semibold">
            {starCount || "0"}
          </span>
        </a>

        {/* Progress Counter */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl border border-border bg-card text-xs text-muted-foreground font-normal">
          <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
          <span>
            Mastered <strong className="text-foreground font-semibold">{completedCount}</strong> of {totalCount}
          </span>
        </div>

        {/* Reset Progress Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-normal"
          title="Reset topic completion progress"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        {/* Auth Controls */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-xs font-normal">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" size="sm" className="text-xs bg-foreground text-background hover:bg-foreground/90 font-medium">
                Sign Up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              userProfileProps={{
                appearance: {
                  variables: {
                    colorBackground: "#080808",
                  },
                  elements: {
                    navbarFooter: "hidden",
                    devModeBadge: "hidden",
                    profileSectionItemValue: "text-white font-semibold text-sm",
                    profileSectionValue: "text-white font-semibold text-sm",
                    profileSectionPrimaryButton: "text-white font-semibold text-xs underline",
                    profileSectionItemLabel: "text-zinc-400 text-xs uppercase font-medium",
                    profileSectionLabel: "text-zinc-400 text-xs uppercase font-medium",
                  },
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}

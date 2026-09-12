"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, CheckCircle2, Zap, Trophy } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { calculateUserPoints, formatPoints } from "@/lib/points";
import { ROLES } from "@/data/roles";

function formatStarCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const topics = useStudyStore((state) => state.topics);
  const activeTopicId = useStudyStore((state) => state.activeTopicId);
  const completedTopics = useStudyStore((state) => state.completedTopics);
  const mcqAnswers = useStudyStore((state) => state.mcqAnswers);
  const selectedRole = useStudyStore((state) => state.selectedRole);
  const toggleSidebar = useStudyStore((state) => state.toggleSidebar);
  const solvedChallenges = useStudyStore((state) => state.solvedChallenges);
  const getPointsSummary = useStudyStore((state) => state.getPointsSummary);

  const roleTopics = useMemo(() => {
    if (!selectedRole || selectedRole === "all") return topics;
    const roleDef = ROLES.find((r) => r.id === selectedRole);
    if (!roleDef) return topics;
    return topics.filter((t) => roleDef.categories.includes(t.category));
  }, [topics, selectedRole]);

  const activeTopic = useMemo(() => {
    const foundInRole = roleTopics.find((t) => t.id === activeTopicId);
    if (foundInRole) return foundInRole;
    return roleTopics[0] || topics.find((t) => t.id === activeTopicId) || topics[0];
  }, [topics, roleTopics, activeTopicId]);

  const pointsSummary = useMemo(() => {
    return getPointsSummary();
  }, [topics, completedTopics, mcqAnswers, solvedChallenges, getPointsSummary]);

  const currentUserPoints = useMemo(() => {
    return {
      topicPoints: pointsSummary.completionPointsTotal + pointsSummary.bonusPointsTotal,
      mcqPoints: pointsSummary.mcqPointsTotal,
      codingPoints: pointsSummary.codingPoints?.totalCodingPoints || 0,
      totalPoints: pointsSummary.totalPoints,
    };
  }, [pointsSummary]);

  const [userRank, setUserRank] = useState<number>(1);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard rank");
        return res.json();
      })
      .then((data) => {
        if (typeof data?.currentUserRank === "number") {
          setUserRank(data.currentUserRank);
        }
      })
      .catch(() => {
        setUserRank(1);
      });
  }, [user, currentUserPoints.totalPoints]);

  const totalCount = roleTopics.length;
  const completedCount = roleTopics.filter((t) => completedTopics.includes(t.id)).length;

  const [starCount, setStarCount] = useState<string | null>(null);

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

  return (
    <header className="sticky top-0 z-40 h-14 bg-background/90 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between font-normal">
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
          {pathname === "/progress" ? (
            <>
              <Link href="/">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  PROGRESS
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                Quest Roadmap
              </span>
            </>
          ) : pathname === "/points" ? (
            <>
              <Link href="/">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  POINTS
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                Score Breakdown
              </span>
            </>
          ) : pathname === "/leaderboard" ? (
            <>
              <Link href="/">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  LEADERBOARD
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                Global Rankings
              </span>
            </>
          ) : pathname === "/coding" ? (
            <>
              <Link href="/">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  CODING
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                Interview Arena
              </span>
            </>
          ) : pathname === "/sign-in" ? (
            <>
              <Badge variant="secondary" className="font-medium uppercase text-[10px]">
                AUTH
              </Badge>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                Sign In
              </span>
            </>
          ) : pathname === "/sign-up" ? (
            <>
              <Badge variant="secondary" className="font-medium uppercase text-[10px]">
                AUTH
              </Badge>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                Sign Up
              </span>
            </>
          ) : (
            <>
              <Link href="/">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  {activeTopic.category}
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
                {activeTopic.title}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 font-normal">
        {/* User Rank Badge */}
        <Link href="/leaderboard" title="View Leaderboard">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Trophy className="w-3.5 h-3.5 text-foreground" />
            <span>#{userRank} Rank</span>
          </div>
        </Link>

        {/* User Points Badge */}
        <Link href="/points" title="View Points Breakdown">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Zap className="w-3.5 h-3.5 text-foreground fill-foreground" />
            <span>{formatPoints(pointsSummary.totalPoints)} pts</span>
          </div>
        </Link>

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
        <Link href="/progress">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl border border-border bg-card text-xs text-muted-foreground font-normal">
            <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
            <span>
              Mastered <strong className="text-foreground font-semibold">{completedCount}</strong> of {totalCount}
            </span>
          </div>
        </Link>
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
                    colorBackground: "var(--clerk-bg-header)",
                  },
                  elements: {
                    navbarFooter: "hidden",
                    devModeBadge: "hidden",
                    profileSectionItemValue: "text-foreground font-semibold text-sm",
                    profileSectionValue: "text-foreground font-semibold text-sm",
                    profileSectionPrimaryButton: "text-foreground font-semibold text-xs underline",
                    profileSectionItemLabel: "text-muted-foreground text-xs uppercase font-medium",
                    profileSectionLabel: "text-muted-foreground text-xs uppercase font-medium",
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

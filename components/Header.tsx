"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, CheckCircle2, Zap, Trophy } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import UserMenu from "./UserMenu";
import AuthModal from "./AuthModal";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { calculateUserPoints, formatKPoints } from "@/lib/points";
import { ROLES } from "@/data/roles";
import { getLocalUserLeaderboardEntry, computeRankedLeaderboard } from "@/lib/leaderboard";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"sign-in" | "sign-up">("sign-in");
  const {
    topics,
    completedTopics,
    activeTopicId,
    selectedRole,
    mcqAnswers,
    solvedChallenges,
    getPointsSummary,
    getRoleFilteredTopics,
    toggleSidebar,
  } = useStudyStore();

  const roleTopics = useMemo(() => {
    return getRoleFilteredTopics();
  }, [topics, selectedRole, getRoleFilteredTopics]);

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

  const localUserEntry = useMemo(() => {
    return getLocalUserLeaderboardEntry(currentUserPoints, user);
  }, [currentUserPoints, user]);

  const [userRank, setUserRank] = useState<number>(1);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/leaderboard", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard rank");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.leaderboard)) {
          const rankedResult = computeRankedLeaderboard(data.leaderboard, localUserEntry, Boolean(user));
          setUserRank(rankedResult.currentUserRank);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setUserRank(1);
      });

    return () => controller.abort();
  }, [user, localUserEntry]);

  const totalCount = roleTopics.length;
  const completedCount = roleTopics.filter((t) => completedTopics.includes(t.id)).length;

  const [starCount, setStarCount] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github-stars", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Internal route error");
        return res.json();
      })
      .then((data) => {
        if (typeof data?.stars === "number") {
          setStarCount(formatStarCount(data.stars));
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        // Fallback directly to ungh.cc API if local route fails
        fetch("https://ungh.cc/repos/jaychauhan-exe1/devdocs", { signal: controller.signal })
          .then((res) => res.json())
          .then((data) => {
            if (typeof data?.repo?.stars === "number") {
              setStarCount(formatStarCount(data.repo.stars));
            }
          })
          .catch((e) => {
            if (e.name === "AbortError") return;
            console.warn("Failed to fetch live GitHub stars", e);
          });
      });

    return () => controller.abort();
  }, []);

  return (
    <header className="shrink-0 sticky top-0 z-40 h-14 bg-background/90 backdrop-blur-md border-b border-border px-2.5 sm:px-6 lg:px-8 flex items-center justify-between font-normal min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-3 font-normal min-w-0 pr-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-1.5 text-xs font-normal min-w-0">
          {pathname === "/progress" ? (
            <>
              <Link href="/" className="shrink-0">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  PROGRESS
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                Quest Roadmap
              </span>
            </>
          ) : pathname === "/points" ? (
            <>
              <Link href="/" className="shrink-0">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  POINTS
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                Score Breakdown
              </span>
            </>
          ) : pathname === "/leaderboard" ? (
            <>
              <Link href="/" className="shrink-0">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  LEADERBOARD
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                Global Rankings
              </span>
            </>
          ) : pathname === "/coding" ? (
            <>
              <Link href="/" className="shrink-0">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  CODING
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                Interview Arena
              </span>
            </>
          ) : pathname === "/sign-in" ? (
            <>
              <Badge variant="secondary" className="font-medium uppercase text-[10px] shrink-0">
                AUTH
              </Badge>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                Sign In
              </span>
            </>
          ) : pathname === "/sign-up" ? (
            <>
              <Badge variant="secondary" className="font-medium uppercase text-[10px] shrink-0">
                AUTH
              </Badge>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                Sign Up
              </span>
            </>
          ) : (
            <>
              <Link href="/" className="shrink-0">
                <Badge variant="secondary" className="font-medium uppercase text-[10px] hover:bg-secondary/80 cursor-pointer transition-colors">
                  {activeTopic.category}
                </Badge>
              </Link>
              <span className="text-muted-foreground font-normal shrink-0">/</span>
              <span className="text-foreground font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                {activeTopic.title}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 font-normal">
        {/* User Rank Badge - Hidden on Mobile */}
        <Link href="/leaderboard" title="View Leaderboard" className="hidden sm:flex">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Trophy className="w-3.5 h-3.5 text-foreground" />
            <span>#{userRank} Rank</span>
          </div>
        </Link>

        {/* User Points Badge - Hidden on Mobile */}
        <Link href="/points" title="View Points Breakdown" className="hidden sm:flex">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Zap className="w-3.5 h-3.5 text-foreground fill-foreground" />
            <span>{formatKPoints(pointsSummary.totalPoints)} pts</span>
          </div>
        </Link>

        {/* Dynamic GitHub Star Badge - Visible on Mobile */}
        <a
          href="https://github.com/jaychauhan-exe1/devdocs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-all hover:scale-105 active:scale-95 shrink-0"
          title="Star on GitHub"
        >
          <FaGithub className="w-4 h-4 text-foreground" />
          <span className="text-xs font-semibold">
            {starCount || "0"}
          </span>
        </a>

        {/* Progress Counter - Hidden on Mobile & Tablet */}
        <Link href="/progress" className="hidden md:flex">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-border bg-card text-xs text-muted-foreground font-normal">
            <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
            <span>
              Mastered <strong className="text-foreground font-semibold">{completedCount}</strong> of {totalCount}
            </span>
          </div>
        </Link>

        {/* Auth Controls */}
        <div className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-border">
          {!user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthModalMode("sign-in");
                  setShowAuthModal(true);
                }}
                className="hidden sm:inline-flex text-xs font-normal"
              >
                Sign In
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setAuthModalMode("sign-up");
                  setShowAuthModal(true);
                }}
                className="text-xs bg-foreground text-background hover:bg-foreground/90 font-medium px-3 sm:px-4"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <UserMenu />
          )}
        </div>
      </div>

      {/* Global Custom Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
      />
    </header>
  );
}

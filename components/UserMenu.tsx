"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useStudyStore } from "@/store/useStudyStore";
import { formatPoints } from "@/lib/points";
import Link from "next/link";
import {
  User,
  LogOut,
  Trophy,
  Zap,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getPointsSummary = useStudyStore((state) => state.getPointsSummary);
  const topics = useStudyStore((state) => state.topics);
  const completedTopics = useStudyStore((state) => state.completedTopics);

  const pointsSummary = getPointsSummary();
  const completedCount = completedTopics.length;
  const totalCount = topics.length;

  const [userRank, setUserRank] = useState<number>(1);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rank");
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
  }, [user, pointsSummary.totalPoints]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const userInitials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.firstName
      ? user.firstName[0].toUpperCase()
      : (user.primaryEmailAddress?.emailAddress[0] || "U").toUpperCase();

  const userDisplayName =
    user.username
      ? `@${user.username}`
      : user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || "Developer";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Dropdown Avatar Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-border bg-card/80 hover:bg-secondary transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={userDisplayName}
            className="w-7 h-7 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground">
            {userInitials}
          </div>
        )}
        <span className="text-xs font-semibold text-foreground max-w-[100px] truncate hidden sm:inline-block">
          {user.firstName || userDisplayName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Custom Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-card border border-border shadow-2xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100">
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/80">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={userDisplayName}
                className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-sm text-foreground shrink-0">
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{userDisplayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          {/* User Stats Card */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-secondary/50 rounded-xl border border-border/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>#{userRank} Rank</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-foreground justify-end">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{formatPoints(pointsSummary.totalPoints)} pts</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="space-y-1">
            <Link
              href="/progress"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                <span>Progress Roadmap</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </Link>

            <Link
              href="/points"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-foreground" />
                <span>Points Ledger</span>
              </div>
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-foreground" />
                <span>Leaderboard</span>
              </div>
            </Link>
          </div>

          <div className="pt-2 border-t border-border/80">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                useStudyStore.getState().resetUserProgress();
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

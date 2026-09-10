"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { useUser } from "@clerk/nextjs";
import { calculateUserPoints, formatPoints } from "@/lib/points";
import { LeaderboardUser, getLocalUserLeaderboardEntry } from "@/lib/leaderboard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Medal,
  Search,
  Zap,
  TrendingUp,
  Loader2,
  Users,
} from "lucide-react";

export default function LeaderboardView() {
  const { user } = useUser();
  const { topics, completedTopics, mcqAnswers } = useStudyStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const pointsSummary = useMemo(() => {
    return calculateUserPoints(topics, completedTopics, mcqAnswers);
  }, [topics, completedTopics, mcqAnswers]);

  const currentUserPoints = useMemo(() => {
    return {
      topicPoints: pointsSummary.completionPointsTotal + pointsSummary.bonusPointsTotal,
      mcqPoints: pointsSummary.mcqPointsTotal,
      totalPoints: pointsSummary.totalPoints,
    };
  }, [pointsSummary]);

  const localUserEntry = useMemo(() => {
    return getLocalUserLeaderboardEntry(currentUserPoints, user);
  }, [currentUserPoints, user]);

  const [leaderboardState, setLeaderboardState] = useState<{
    leaderboard: LeaderboardUser[];
    currentUserRank: number;
    totalParticipants: number;
  }>({
    leaderboard: [localUserEntry],
    currentUserRank: 1,
    totalParticipants: 1,
  });

  const fetchRealLeaderboard = () => {
    setLoading(true);
    fetch("/api/leaderboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.leaderboard) && data.leaderboard.length > 0) {
          setLeaderboardState({
            leaderboard: data.leaderboard,
            currentUserRank: data.currentUserRank || 1,
            totalParticipants: data.totalParticipants || data.leaderboard.length,
          });
        }
      })
      .catch((err) => {
        console.warn("Falling back to active user entry:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRealLeaderboard();
  }, [user, currentUserPoints.totalPoints]);

  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardState.leaderboard;
    const query = searchQuery.toLowerCase().trim();
    return leaderboardState.leaderboard.filter((u) => u.username.toLowerCase().includes(query));
  }, [leaderboardState.leaderboard, searchQuery]);

  const topScorer = leaderboardState.leaderboard[0] || localUserEntry;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 font-normal">
      {/* Top Banner / Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Your Rank Card */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Your Global Rank
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">
                #{leaderboardState.currentUserRank}
              </span>
              <span className="text-xs text-muted-foreground">
                of {leaderboardState.totalParticipants} {leaderboardState.totalParticipants === 1 ? "user" : "users"}
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary border border-border text-foreground">
            <Trophy className="w-7 h-7 text-foreground" />
          </div>
        </div>

        {/* Your Total Points Card */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Your Total Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">
                {formatPoints(currentUserPoints.totalPoints)}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                pts
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary border border-border text-foreground">
            <Zap className="w-7 h-7 text-foreground fill-foreground" />
          </div>
        </div>

        {/* Top Leader Card */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Leaderboard #1
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <img
                src={topScorer?.avatarUrl}
                alt={topScorer?.username}
                className="w-7 h-7 rounded-full object-cover border border-border"
              />
              <span className="text-base font-bold text-foreground truncate max-w-[120px]">
                {topScorer?.username}
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary border border-border text-amber-400">
            <Medal className="w-7 h-7 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table Container */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-6 space-y-5">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-foreground" />
              <span>Leaderboard</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 text-xs"
              />
            </div>

            {loading && (
              <div className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Data List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-3 px-3 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Developer</th>
                <th className="py-3 px-4 text-right">Topic Pts</th>
                <th className="py-3 px-4 text-right">MCQ Pts</th>
                <th className="py-3 px-4 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredLeaderboard.map((u) => {
                const isRank1 = u.rank === 1;
                const isRank2 = u.rank === 2;
                const isRank3 = u.rank === 3;

                return (
                  <motion.tr
                    key={u.id}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                    transition={{ duration: 0.1 }}
                    className={`transition-colors ${u.isCurrentUser
                      ? "bg-secondary/70 border-l-4 border-l-foreground font-medium"
                      : ""
                      }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {isRank1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/40 text-xs">
                          🥇 1
                        </span>
                      ) : isRank2 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-300/20 text-zinc-300 font-bold border border-zinc-300/40 text-xs">
                          🥈 2
                        </span>
                      ) : isRank3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 font-bold border border-amber-700/40 text-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          #{u.rank}
                        </span>
                      )}
                    </td>

                    {/* Developer Info (Profile Photo + Username ONLY) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.username}
                          className="w-8.5 h-8.5 rounded-full object-cover border border-border shadow-sm flex-shrink-0"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-foreground text-sm truncate max-w-[160px] sm:max-w-[220px]">
                            {u.username}
                          </span>
                          {u.isCurrentUser && (
                            <Badge
                              variant="default"
                              className="text-[10px] px-2 py-0.5 bg-foreground text-background font-extrabold uppercase rounded-full"
                            >
                              YOU
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Topic Wise Points */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground font-medium">
                      {formatPoints(u.topicPoints)} pts
                    </td>

                    {/* MCQ Wise Points */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground font-medium">
                      {formatPoints(u.mcqPoints)} pts
                    </td>

                    {/* Total Points */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-secondary border border-border font-mono text-xs font-bold text-foreground">
                        {formatPoints(u.totalPoints)} pts
                      </span>
                    </td>
                  </motion.tr>
                );
              })}

              {filteredLeaderboard.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    No registered developers match "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { calculateUserPoints, formatPoints } from "@/lib/points";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Search,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PointsView() {
  const router = useRouter();
  const setActiveTopicId = useStudyStore((state) => state.setActiveTopicId);
  const topics = useStudyStore((state) => state.topics);
  const completedTopics = useStudyStore((state) => state.completedTopics);
  const mcqAnswers = useStudyStore((state) => state.mcqAnswers);
  const solvedChallenges = useStudyStore((state) => state.solvedChallenges);
  const getPointsSummary = useStudyStore((state) => state.getPointsSummary);

  const pointsSummary = useMemo(() => {
    return getPointsSummary();
  }, [topics, completedTopics, mcqAnswers, solvedChallenges, getPointsSummary]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"earned" | "perfect">("earned");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    totalPoints,
    completionPointsTotal,
    bonusPointsTotal,
    deductionPointsTotal,
    correctMcqsTotal,
    topicBreakdown,
    codingPoints,
  } = pointsSummary;

  const filteredTopics = topicBreakdown.filter((item) => {
    const matchesSearch =
      item.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === "earned" && item.totalTopicPoints <= 0) return false;
    if (filterType === "perfect" && !item.isPerfectBonus) return false;

    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28 font-normal">
      {/* Top Points Summary Banner (Monochrome Glass Card) */}
      <Card className="bg-card border-border shadow-2xl p-6 sm:p-10 relative overflow-hidden font-normal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 font-normal">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <span>Points Breakdown</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              Earn points by solving coding challenges (+2 Easy, +3 Medium, +4 Hard), mastering concepts (+2.0), answering MCQ quiz questions (+1.0), avoiding wrong choices (-0.5), and securing perfect 100% topic completions (+3.0).
            </p>
          </div>

          {/* Big Points Total Counter Card (Monochrome High Contrast) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-secondary border border-border flex flex-col items-center justify-center min-w-[210px] text-center shadow-2xl"
          >
            <div className="p-3.5 rounded-2xl bg-background border border-border text-foreground mb-2 shadow-inner">
              <Zap className="w-8 h-8 fill-foreground text-foreground" />
            </div>
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Total Score</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {formatPoints(totalPoints)}
            </span>
            <span className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">Points Earned</span>
          </motion.div>
        </div>
      </Card>

      {/* Points Summary Breakdown Stats */}
      <Card className="bg-card border-border p-6 font-normal space-y-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-foreground" />
          <span>Points Category Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm font-normal">
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-xs text-muted-foreground block">Topic Completion Pts</span>
            <span className="text-xl font-bold text-foreground">+{completionPointsTotal} pts</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-xs text-muted-foreground block">MCQ Correct Pts</span>
            <span className="text-xl font-bold text-foreground">+{correctMcqsTotal * 1} pts</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-xs text-muted-foreground block">Coding Challenges Pts</span>
            <span className="text-xl font-bold text-foreground">+{codingPoints?.totalCodingPoints || 0} pts</span>
            <span className="text-[10px] text-muted-foreground block font-mono">2 Easy • 3 Med • 4 Hard</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-xs text-muted-foreground block">MCQ Deductions</span>
            <span className="text-xl font-bold text-muted-foreground">-{formatPoints(deductionPointsTotal)} pts</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1">
            <span className="text-xs text-muted-foreground block">Perfect Mastery Bonus</span>
            <span className="text-xl font-bold text-foreground">+{bonusPointsTotal} pts</span>
          </div>
        </div>
      </Card>

      {/* Topic-by-Topic Points Table */}
      <div className="space-y-4 font-normal">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Topic Score Ledger ({filteredTopics.length})
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64 font-normal">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search topic points..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs font-normal"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 font-normal">
              <Button
                variant={filterType === "earned" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("earned")}
                className="text-xs font-medium flex-1 sm:flex-initial"
              >
                Scored
              </Button>
              <Button
                variant={filterType === "perfect" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("perfect")}
                className="text-xs font-medium flex-1 sm:flex-initial"
              >
                Perfect
              </Button>
            </div>
          </div>
        </div>

        {/* Ledger List Cards (Monochrome) */}
        <div className="space-y-3 font-normal">
          {filteredTopics.map((item) => (
            <Card
              key={item.topicId}
              className="bg-card border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-foreground/40 transition-colors font-normal"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] uppercase font-medium">
                    {item.category}
                  </Badge>
                  {item.isCompleted && (
                    <Badge variant="outline" className="text-[10px] font-mono border-border bg-secondary/80 text-foreground">
                      ✓ Mastered (+2)
                    </Badge>
                  )}
                  {item.isPerfectBonus && (
                    <Badge variant="outline" className="text-[10px] font-mono border-border bg-foreground text-background font-bold">
                      ★ Perfect Bonus (+3)
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-base text-foreground truncate">{item.topicTitle}</h3>

                {/* Score breakdown tags */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span>MCQs: <strong className="text-foreground font-semibold">{item.correctCount}</strong>/{item.totalMcqs} correct</span>
                  {item.incorrectCount > 0 && (
                    <span className="text-muted-foreground font-medium">-{item.incorrectCount * 0.5} pts (wrong)</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end flex-shrink-0">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-normal">Topic Score</span>
                  <span className={`text-xl font-bold ${item.totalTopicPoints > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.totalTopicPoints > 0 ? `+${formatPoints(item.totalTopicPoints)}` : formatPoints(item.totalTopicPoints)} pts
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTopicId(item.topicId);
                    router.push("/");
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium"
                >
                  <span>Study Concept</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}

          {filteredTopics.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground font-normal">
              No matching topic scores found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { ROLES } from "@/data/roles";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import { triggerHaptic } from "@/lib/haptics";
import { formatKPoints } from "@/lib/points";
import {
  CheckCircle2,
  Navigation,
  ArrowUpRight,
  Route,
  BarChart2,
  Trophy,
  Flame,
  Award,
  Code2,
  Server,
  Globe,
  Layers,
  Database,
  Cpu,
  Shield,
  Binary,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryType } from "@/data/topics";

const CATEGORY_ICONS: Record<CategoryType, React.ReactNode> = {
  JAVASCRIPT: <Code2 className="w-4 h-4 text-foreground" />,
  REACT: <Zap className="w-4 h-4 text-foreground" />,
  NODE: <Server className="w-4 h-4 text-foreground" />,
  HTTP: <Globe className="w-4 h-4 text-foreground" />,
  REDIS: <Layers className="w-4 h-4 text-foreground" />,
  MYSQL: <Database className="w-4 h-4 text-foreground" />,
  "SYSTEM DESIGN": <Cpu className="w-4 h-4 text-foreground" />,
  SECURITY: <Shield className="w-4 h-4 text-foreground" />,
  DSA: <Binary className="w-4 h-4 text-foreground" />,
};

export default function ProgressRoadmapView() {
  const router = useRouter();
  const { user } = useUser();
  const {
    completedTopics,
    activeTopicId,
    setActiveTopicId,
    toggleTopicComplete,
    topics,
    selectedRole,
    solvedChallenges,
    getPointsSummary,
  } = useStudyStore();

  const [viewTab, setViewTab] = useState<"map" | "analytics">("map");

  const roleTopics = useMemo(() => {
    if (!selectedRole || selectedRole === "all") return topics;
    const roleDef = ROLES.find((r) => r.id === selectedRole);
    if (!roleDef) return topics;
    return topics.filter((t) => roleDef.categories.includes(t.category));
  }, [topics, selectedRole]);

  const currentTopicRef = useRef<HTMLDivElement>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const totalCount = roleTopics.length;
  const completedCount = roleTopics.filter((t) => completedTopics.includes(t.id)).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find user's current position (first uncompleted topic index, or last if all completed)
  const currentLevelIndex = roleTopics.findIndex((t) => !completedTopics.includes(t.id));
  const userPositionIndex = currentLevelIndex !== -1 ? currentLevelIndex : Math.max(0, roleTopics.length - 1);

  // Category statistics calculation
  const categories = Array.from(new Set(roleTopics.map((t) => t.category))) as CategoryType[];
  const categoryStats = categories.map((cat) => {
    const catTopics = roleTopics.filter((t) => t.category === cat);
    const catCompleted = catTopics.filter((t) => completedTopics.includes(t.id)).length;
    return {
      name: cat,
      completed: catCompleted,
      total: catTopics.length,
      percentage: catTopics.length > 0 ? Math.round((catCompleted / catTopics.length) * 100) : 0,
    };
  });

  // Manual scroll to user's current level when button clicked
  const scrollToCurrentLevel = (smooth = true) => {
    if (currentTopicRef.current) {
      currentTopicRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };

  useEffect(() => {
    if (viewTab === "map") {
      scrollToCurrentLevel(false);
      const timer = setTimeout(() => scrollToCurrentLevel(false), 50);
      return () => clearTimeout(timer);
    } else {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
  }, [userPositionIndex, viewTab]);

  // Calculate Zigzag Node Coordinates for Map Rendering (Bottom-to-Top Snake Path)
  const verticalStep = 150;
  const amplitude = 115;

  const nodesWithCoords = roleTopics.map((topic, idx) => {
    const xOffset = Math.sin(idx * 0.7) * amplitude;
    // Reverse y position so index 0 is at the bottom
    const y = (totalCount - 1 - idx) * verticalStep + 140;
    const isCompleted = completedTopics.includes(topic.id);
    const isCurrentPosition = idx === userPositionIndex;
    const isActive = topic.id === activeTopicId;

    return {
      topic,
      idx,
      xOffset,
      y,
      isCompleted,
      isCurrentPosition,
      isActive,
    };
  });

  const sortedNodesForSvg = [...nodesWithCoords].sort((a, b) => a.y - b.y);

  // Generate SVG Bezier Path String
  const svgPathD = sortedNodesForSvg.reduce((acc, curr, i) => {
    const centerX = 200;
    const x = centerX + curr.xOffset;
    const y = curr.y;

    if (i === 0) {
      return `M ${x} ${y}`;
    }

    const prev = sortedNodesForSvg[i - 1];
    const prevX = centerX + prev.xOffset;
    const prevY = prev.y;

    const cp1Y = prevY + verticalStep * 0.5;
    const cp2Y = y - verticalStep * 0.5;

    return `${acc} C ${prevX} ${cp1Y}, ${x} ${cp2Y}, ${x} ${y}`;
  }, "");

  const totalMapHeight = totalCount * verticalStep + 240;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 font-normal">
      {/* ==============================================================
          TAB 1: ROADMAP VIEW (3D Candy Crush Style Winding Road)
          ============================================================== */}
      {viewTab === "map" && (
        <div className="space-y-6 font-normal">
          {/* Sticky Top Map Action Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-md font-normal min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Badge variant="outline" className="px-2.5 py-1 text-[10px] sm:text-xs font-mono uppercase font-semibold shrink-0">
                Check {userPositionIndex + 1}/{totalCount}
              </Badge>
              <span className="text-xs sm:text-sm font-medium text-foreground truncate min-w-0 flex-1">
                {roleTopics[userPositionIndex]?.title || "All Mastered!"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToCurrentLevel(true)}
              className="flex items-center gap-1.5 text-xs font-medium shrink-0 px-2.5 sm:px-3 h-8 sm:h-9"
            >
              <Navigation className="w-3.5 h-3.5 text-foreground shrink-0" />
              <span className="hidden xs:inline sm:inline">Jump to My Position</span>
              <span className="xs:hidden sm:hidden">Jump</span>
            </Button>
          </div>

          {/* Candy Crush Style 3D Winding Road Canvas */}
          <Card className="bg-card border-border shadow-2xl p-4 sm:p-8 overflow-visible relative min-h-[600px] flex justify-center">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-xl overflow-hidden"
              style={{
                backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative w-full max-w-[400px] mx-auto" style={{ height: totalMapHeight }}>
              {/* 3D Winding Road SVG Path (6-Layer 3D Depth Stack) */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox={`0 0 400 ${totalMapHeight}`}
                preserveAspectRatio="none"
                fill="none"
              >
                {/* Layer 1: Ambient Ground Soft Blur Shadow */}
                <path
                  d={svgPathD}
                  stroke="rgba(0, 0, 0, 0.85)"
                  strokeWidth="32"
                  strokeLinecap="round"
                  className="blur-[2px]"
                />
                {/* Layer 2: 3D Dark Base Embankment Foundation */}
                <path
                  d={svgPathD}
                  stroke="#09090b"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* Layer 3: 3D Outer Road Curb Rim */}
                <path
                  d={svgPathD}
                  stroke="#27272a"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Layer 4: Main Asphalt Road Track Surface */}
                <path
                  d={svgPathD}
                  stroke="#141417"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Layer 5: Top Specular Light Reflection Streak */}
                <path
                  d={svgPathD}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Layer 6: Center Dashed Lane Marker Line */}
                <path
                  d={svgPathD}
                  stroke="#71717a"
                  strokeWidth="2.5"
                  strokeOpacity="0.6"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                />
              </svg>

              {/* Render Checkpoint Nodes */}
              {nodesWithCoords.map((node) => {
                const centerX = 200;
                const nodeX = centerX + node.xOffset;

                return (
                  <div
                    key={node.topic.id}
                    ref={node.isCurrentPosition ? currentTopicRef : undefined}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                    style={{ left: `${(nodeX / 400) * 100}%`, top: `${node.y}px` }}
                  >
                    {/* User Avatar Marker Pin on Dynamic Side of Current Position (3D Floating Badge) */}
                    {node.isCurrentPosition && (
                      node.xOffset < 0 ? (
                        // Node is on left side of map -> place "You" badge to the RIGHT of node
                        <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-30 flex items-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] w-max max-w-none">
                          {/* White Arrow Tip pointing left towards node */}
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-foreground -mr-px flex-shrink-0" />
                          {/* 3D White Pill Container with Profile Picture & "You" */}
                          <div className="flex items-center gap-2 bg-foreground text-background pl-1.5 pr-4 py-1.5 rounded-full shadow-[0_6px_0_#18181b,0_10px_20px_rgba(0,0,0,0.8)] border-2 border-background whitespace-nowrap">
                            <div className="p-0.5 rounded-full bg-background/20 flex-shrink-0">
                              {user?.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt="User Avatar"
                                  className="w-7.5 h-7.5 rounded-full object-cover shadow-md"
                                />
                              ) : (
                                <div className="w-7.5 h-7.5 rounded-full bg-background text-foreground font-bold flex items-center justify-center text-[10px]">
                                  Y
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-extrabold tracking-tight text-background whitespace-nowrap pr-0.5">
                              You
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Node is on right side of map -> place "You" badge to the LEFT of node
                        <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-30 flex items-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] w-max max-w-none">
                          {/* 3D White Pill Container with Profile Picture & "You" */}
                          <div className="flex items-center gap-2 bg-foreground text-background pl-1.5 pr-4 py-1.5 rounded-full shadow-[0_6px_0_#18181b,0_10px_20px_rgba(0,0,0,0.8)] border-2 border-background whitespace-nowrap">
                            <div className="p-0.5 rounded-full bg-background/20 flex-shrink-0">
                              {user?.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt="User Avatar"
                                  className="w-7.5 h-7.5 rounded-full object-cover shadow-md"
                                />
                              ) : (
                                <div className="w-7.5 h-7.5 rounded-full bg-background text-foreground font-bold flex items-center justify-center text-[10px]">
                                  Y
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-extrabold tracking-tight text-background whitespace-nowrap pr-0.5">
                              You
                            </span>
                          </div>
                          {/* White Arrow Tip pointing right towards node */}
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[7px] border-l-foreground -ml-px flex-shrink-0" />
                        </div>
                      )
                    )}

                    {/* Glossy Metallic 3D Glass Orb Checkpoint Button */}
                    <motion.button
                      whileHover={{ scale: 1.15, y: -3 }}
                      whileTap={{ scale: 0.92, y: 2 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      onClick={() => {
                        triggerHaptic("medium");
                        setSelectedTopicId(node.topic.id);
                      }}
                      className={`relative w-15 h-15 sm:w-17 sm:h-17 rounded-full p-[3px] cursor-pointer ${node.isCompleted
                          ? "shadow-[0_10px_22px_rgba(16,185,129,0.45),0_4px_0_#059669]"
                          : node.isCurrentPosition
                            ? "shadow-[0_10px_22px_rgba(255,255,255,0.5),0_4px_0_#d4d4d8]"
                            : "shadow-[0_10px_22px_rgba(0,0,0,0.8),0_4px_0_rgba(0,0,0,0.6)]"
                        }`}
                    >
                      {/* Outer Metallic / Vibrant Bevel Ring */}
                      <div className={`w-full h-full rounded-full p-[2.5px] shadow-inner ${node.isCompleted
                          ? "bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-600"
                          : node.isCurrentPosition
                            ? "bg-gradient-to-b from-white via-zinc-100 to-zinc-300 ring-4 ring-white/50"
                            : "bg-gradient-to-b from-zinc-300 via-zinc-600 to-zinc-950"
                        }`}>
                        {/* Inner Groove Border */}
                        <div className={`w-full h-full rounded-full p-[2px] ${node.isCompleted
                            ? "bg-emerald-950"
                            : node.isCurrentPosition
                              ? "bg-zinc-300"
                              : "bg-zinc-950"
                          }`}>
                          {/* Inner Bevel Ring */}
                          <div className={`w-full h-full rounded-full p-[2px] ${node.isCompleted
                              ? "bg-gradient-to-b from-emerald-100 via-emerald-300 to-emerald-500"
                              : node.isCurrentPosition
                                ? "bg-gradient-to-b from-white via-zinc-50 to-zinc-200"
                                : "bg-gradient-to-b from-zinc-400 via-zinc-700 to-zinc-200"
                            }`}>
                            {/* Main Glossy Sphere Canvas */}
                            <div className={`relative w-full h-full rounded-full flex items-center justify-center overflow-hidden ${node.isCompleted
                                ? "bg-[radial-gradient(circle_at_35%_25%,#a7f3d0_0%,#34d399_40%,#10b981_75%,#059669_100%)] text-white shadow-[inset_0_-4px_8px_rgba(4,120,87,0.3)]"
                                : node.isCurrentPosition
                                  ? "bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#ffffff_60%,#fafafa_85%,#f4f4f5_100%)] text-zinc-950 shadow-[inset_0_-3px_6px_rgba(161,161,170,0.25)]"
                                  : "bg-[radial-gradient(circle_at_40%_25%,#71717a_0%,#3f3f46_30%,#18181b_65%,#09090b_100%)] text-white shadow-[inset_0_-8px_12px_rgba(0,0,0,0.9)]"
                              }`}>
                              {/* Top-Left Glossy Glass Crescent Glare */}
                              <div className="absolute top-[8%] left-[10%] w-[58%] h-[42%] rounded-[100%] bg-gradient-to-b from-white/90 via-white/30 to-transparent -rotate-[22deg] blur-[0.2px] pointer-events-none z-10" />

                              {/* Bottom Curved Glass Inner Light Rim */}
                              <div className={`absolute bottom-[6%] inset-x-[15%] h-[20%] rounded-[100%] blur-[0.5px] pointer-events-none z-10 ${node.isCompleted
                                  ? "bg-gradient-to-t from-emerald-200/60 to-transparent"
                                  : node.isCurrentPosition
                                    ? "bg-gradient-to-t from-white/80 to-transparent"
                                    : "bg-gradient-to-t from-white/30 to-transparent"
                                }`} />

                              {/* Icon or Level Number */}
                              {node.isCompleted ? (
                                <CheckCircle2 className="w-7 h-7 text-white stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-20" />
                              ) : (
                                <span className={`font-black font-mono text-base sm:text-lg relative z-20 ${node.isCurrentPosition ? "text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" : "text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]"
                                  }`}>
                                  {node.idx + 1}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Interactive Topic Title Badge */}
                    <div
                      onClick={() => {
                        triggerHaptic("medium");
                        setSelectedTopicId(node.topic.id);
                      }}
                      className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-full sm:ml-3.5 sm:top-1/2 sm:-translate-y-1/2 sm:mt-0 sm:translate-x-0 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap border shadow-[0_4px_0_#18181b,0_6px_12px_rgba(0,0,0,0.5)] cursor-pointer z-20 transition-colors ${node.isCompleted
                          ? "bg-card text-emerald-400 border-emerald-500/50 hover:border-emerald-400 hover:bg-secondary font-medium"
                          : node.isCurrentPosition
                            ? "bg-card text-foreground border-foreground font-bold ring-1 ring-foreground/20"
                            : "bg-card/95 text-foreground border-border/80 hover:border-foreground/50 hover:bg-secondary"
                        }`}
                    >
                      <span className="truncate max-w-[120px] sm:max-w-[180px] block text-center sm:text-left">
                        {node.topic.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ==============================================================
          TAB 2: PROGRESS ANALYTICS DASHBOARD (Monochrome Data View)
          ============================================================== */}
      {viewTab === "analytics" && (
        <div className="space-y-6 font-normal">
          {/* Main Progress Overview Card */}
          <Card className="bg-card border-border shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs uppercase font-semibold">
                    {selectedRole ? selectedRole.replace("-", " ").toUpperCase() : "ALL TOPICS"}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-xs font-mono">
                    {completedCount} / {totalCount} Mastered
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                  <Trophy className="w-7 h-7 text-foreground" />
                  <span>Progress Analytics</span>
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-center flex flex-col items-center justify-center min-w-[140px]">
                <span className="text-xs text-muted-foreground block text-center">Overall Mastered</span>
                <span className="text-2xl font-extrabold text-foreground text-center">{percentage}%</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Completion Status</span>
                <span className="text-foreground">{completedCount} of {totalCount} Topics</span>
              </div>
              <Progress value={percentage} className="h-3 rounded-full" />
            </div>

            {/* Current Milestone Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary border border-border text-foreground">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Mastered Topics</span>
                  <span className="text-lg font-bold text-foreground">{completedCount}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary border border-border text-foreground">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Remaining Topics</span>
                  <span className="text-lg font-bold text-foreground">{totalCount - completedCount}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary border border-border text-foreground">
                  <Award className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-xs text-muted-foreground block">Current Milestone</span>
                  <span className="text-sm font-semibold text-foreground truncate block">
                    {roleTopics[userPositionIndex]?.title || "Complete!"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Coding Challenge Analytics Card — Monochrome */}
          {(() => {
            const codingSummary = getPointsSummary().codingPoints || {
              totalCodingPoints: 0,
              solvedCount: 0,
              easySolved: 0,
              mediumSolved: 0,
              hardSolved: 0,
            };

            return (
              <Card className="bg-card border-border p-6 shadow-sm space-y-4 font-normal">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-secondary border border-border text-foreground shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate">Interview Coding Practice</h3>
                      <p className="text-xs text-muted-foreground truncate">Real-world coding challenge achievements</p>
                    </div>
                  </div>

                  <Link href="/coding" className="shrink-0">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs border-border text-foreground hover:bg-secondary">
                      Open Coding Arena
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground block">Challenges Solved</span>
                    <span className="text-lg font-bold text-foreground">{codingSummary.solvedCount} / 30</span>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground block">Coding Points</span>
                    <span className="text-lg font-bold text-foreground">+{formatKPoints(codingSummary.totalCodingPoints)} pts</span>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground block">Easy / Medium</span>
                    <span className="text-sm font-semibold text-foreground">
                      <span className="text-emerald-400">{codingSummary.easySolved} Easy</span> • <span className="text-amber-400">{codingSummary.mediumSolved} Med</span>
                    </span>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground block">Hard Solved</span>
                    <span className="text-lg font-bold text-red-400">{codingSummary.hardSolved} Hard</span>
                  </div>
                </div>
              </Card>
            );
          })()}

          {/* Category Progress Breakdown Grid */}
          <div className="space-y-3 font-normal">
            <h3 className="text-lg font-bold text-foreground tracking-tight">Category Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categoryStats.map((cat) => (
                <Card
                  key={cat.name}
                  className="bg-card border-border p-5 flex flex-col justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-secondary border border-border text-foreground flex-shrink-0">
                        {CATEGORY_ICONS[cat.name as CategoryType] || <Code2 className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-sm text-foreground truncate">{cat.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs flex-shrink-0">
                      {cat.completed}/{cat.total}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{cat.percentage}%</span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Checkpoint Topic Drawer Modal */}
      <AnimatePresence>
        {selectedTopicId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 max-w-xl mx-auto z-50 font-normal"
          >
            {(() => {
              const selectedTopic = roleTopics.find((t) => t.id === selectedTopicId);
              if (!selectedTopic) return null;

              const isCompleted = completedTopics.includes(selectedTopic.id);

              return (
                <Card className="bg-card/95 backdrop-blur-xl border-border shadow-2xl p-6 space-y-4 font-normal relative">
                  <button
                    onClick={() => setSelectedTopicId(null)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xs font-bold px-2.5 py-1 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/80"
                  >
                    ✕ Close
                  </button>

                  <div className="flex items-center gap-2.5">
                    <Badge variant="secondary" className="uppercase text-xs font-semibold">
                      {selectedTopic.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedTopic.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">⏱️ {selectedTopic.estimatedTime}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedTopic.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {selectedTopic.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <Button
                      variant={isCompleted ? "default" : "secondary"}
                      size="sm"
                      onClick={() => toggleTopicComplete(selectedTopic.id)}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <AnimatedCheckmark checked={isCompleted} size={16} />
                      <span>{isCompleted ? "Completed" : "Mark Mastered"}</span>
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setActiveTopicId(selectedTopic.id);
                        router.push("/");
                      }}
                      className="flex items-center gap-2 font-semibold bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                    >
                      <span>Study Concept</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==============================================================
          STICKY CANDY CRUSH STYLE FOOTER BOTTOM NAVIGATION MENU
          ============================================================== */}
      <div className="sticky bottom-6 z-40 flex justify-center w-full pointer-events-none font-normal">
        <div className="max-w-xs sm:max-w-sm w-full pointer-events-auto px-4">
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl">
            <button
              onClick={() => {
                triggerHaptic("light");
                setViewTab("map");
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${viewTab === "map"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
            >
              <Route className="w-4 h-4" />
              <span>ROADMAP</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic("light");
                setViewTab("analytics");
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${viewTab === "analytics"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>ANALYTICS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

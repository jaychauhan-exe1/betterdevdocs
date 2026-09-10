"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import { triggerHaptic } from "@/lib/haptics";
import {
  CheckCircle2,
  Navigation,
  ArrowUpRight,
  MapPin,
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
    getRoleFilteredTopics,
    selectedRole,
  } = useStudyStore();

  const [viewTab, setViewTab] = useState<"map" | "progress">("map");
  const roleTopics = getRoleFilteredTopics();
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
          TAB 1: MAP VIEW (Candy Crush Style Winding Road)
          ============================================================== */}
      {viewTab === "map" && (
        <div className="space-y-6 font-normal">
          {/* Sticky Top Map Action Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-md font-normal">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 text-xs font-mono uppercase font-semibold">
                Checkpoint {userPositionIndex + 1} of {totalCount}
              </Badge>
              <span className="text-sm font-medium text-foreground truncate max-w-[180px] sm:max-w-none">
                {roleTopics[userPositionIndex]?.title || "All Mastered!"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToCurrentLevel(true)}
              className="flex items-center gap-2 text-xs font-medium"
            >
              <Navigation className="w-3.5 h-3.5 text-foreground" />
              <span>Jump to My Position</span>
            </Button>
          </div>

          {/* Candy Crush Style Winding Road Canvas */}
          <Card className="bg-card border-border shadow-2xl p-4 sm:p-8 overflow-visible relative min-h-[600px] flex justify-center">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-xl overflow-hidden"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative w-full max-w-[520px] px-4 sm:px-8" style={{ height: totalMapHeight }}>
              {/* Winding Road SVG Path */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox={`0 0 400 ${totalMapHeight}`}
                fill="none"
              >
                {/* Outer Glow Path Line */}
                <path
                  d={svgPathD}
                  stroke="currentColor"
                  strokeWidth="18"
                  className="text-border/40"
                  strokeLinecap="round"
                />
                {/* Main Path Track Line */}
                <path
                  d={svgPathD}
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-border"
                  strokeLinecap="round"
                />
                {/* Inner Dashed Track Line */}
                <path
                  d={svgPathD}
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted-foreground/40"
                  strokeDasharray="6 6"
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
                    {/* User Avatar Marker Pin on Left Side of Current Position */}
                    {node.isCurrentPosition && (
                      <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 z-30 flex items-center pointer-events-none drop-shadow-2xl w-max max-w-none">
                        {/* White Pill Container fitting full user name */}
                        <div className="flex items-center gap-2 bg-foreground text-background pl-1.5 pr-4 py-1.5 rounded-full shadow-2xl border border-background whitespace-nowrap">
                          <div className="p-0.5 rounded-full bg-background/20 flex-shrink-0">
                            {user?.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.fullName || "User Avatar"}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-background text-foreground font-bold flex items-center justify-center text-[10px]">
                                {(user?.firstName?.[0] || user?.fullName?.[0] || "Y").toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-extrabold tracking-tight text-background whitespace-nowrap pr-0.5">
                            {user?.firstName || user?.fullName || user?.username || "You"}
                          </span>
                        </div>
                        {/* White Arrow Tip attached cleanly after the pill */}
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[7px] border-l-foreground -ml-px flex-shrink-0" />
                      </div>
                    )}

                    {/* 3D Checkpoint Circle Button (Fast Spring Physics Hover) */}
                    <motion.button
                      whileHover={{ scale: 1.18 }}
                      whileTap={{ scale: 0.90 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      onClick={() => {
                        triggerHaptic("medium");
                        setSelectedTopicId(node.topic.id);
                      }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg ${
                        node.isCompleted
                          ? "bg-foreground text-background border-4 border-foreground font-bold shadow-lg ring-2 ring-foreground/20"
                          : node.isCurrentPosition
                          ? "bg-card text-foreground border-4 border-foreground font-bold shadow-2xl ring-4 ring-foreground/30"
                          : "bg-secondary/80 text-muted-foreground border-4 border-border/80 shadow-inner hover:border-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />

                      {node.isCompleted ? (
                        <CheckCircle2 className="w-6.5 h-6.5 text-background stroke-[2.5]" />
                      ) : (
                        <span className="font-bold font-mono text-sm sm:text-base">
                          {node.idx + 1}
                        </span>
                      )}
                    </motion.button>

                    {/* Topic Title Badge consistently on Right Side */}
                    <div
                      className={`absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border shadow-md transition-all pointer-events-none z-20 ${
                        node.isActive
                          ? "bg-foreground text-background border-foreground font-bold shadow-lg"
                          : node.isCurrentPosition
                          ? "bg-card text-foreground border-foreground font-bold ring-1 ring-foreground/20"
                          : "bg-card/95 text-foreground border-border/80 backdrop-blur-md group-hover:border-foreground/50"
                      }`}
                    >
                      <span className="truncate max-w-[140px] sm:max-w-[180px] block">
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
      {viewTab === "progress" && (
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

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-right min-w-[140px]">
                <span className="text-xs text-muted-foreground block">Overall Mastered</span>
                <span className="text-2xl font-extrabold text-foreground">{percentage}%</span>
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
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xs font-bold px-2 py-1 rounded-lg bg-secondary"
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
                      className="flex items-center gap-2 font-medium"
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
                      className="flex items-center gap-2 font-semibold bg-foreground text-background hover:bg-foreground/90"
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
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                viewTab === "map"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>MAP</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic("light");
                setViewTab("progress");
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                viewTab === "progress"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>PROGRESS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

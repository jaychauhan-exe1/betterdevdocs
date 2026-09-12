"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import AuthModal from "./AuthModal";
import { useStudyStore } from "@/store/useStudyStore";
import { CODING_CHALLENGES, CodingChallenge, CodingDifficulty, TestCase } from "@/data/coding-challenges";
import { ROLES } from "@/data/roles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import VSCodeEditor from "@/components/VSCodeEditor";
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Search,
  Lightbulb,
  Eye,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Zap,
  Terminal,
  Building2,
  Briefcase,
  Layers,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestResult {
  description: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  timeMs: number;
  error?: string | null;
}

interface ConsoleOutputLine {
  type: "log" | "warn" | "error" | "info" | "system";
  text: string;
}

export default function CodingArena() {
  const { isSignedIn } = useUser();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const {
    solvedChallenges,
    challengeAttempts,
    markChallengeSolved,
    saveChallengeAttempt,
    selectedRole,
    setSelectedRole,
    getPointsSummary,
  } = useStudyStore();

  // Navigation state: "list" (show only question list) or "solve" (show full workspace editor)
  const [viewMode, setViewMode] = useState<"list" | "solve">("list");

  // Role filter & path selector state
  const [activeRole, setActiveRole] = useState<string>(selectedRole || "all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Workspace state
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CODING_CHALLENGES[0].id);
  const [code, setCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleOutputLine[] | null>(null);
  const [consoleDuration, setConsoleDuration] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionMode, setExecutionMode] = useState<"run" | "submit" | null>(null);
  const [activeTab, setActiveTab] = useState<"problem" | "hints" | "solution">("problem");
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationPoints, setCelebrationPoints] = useState<number>(0);

  // Sync active role with store role when store changes
  useEffect(() => {
    if (selectedRole) {
      setActiveRole(selectedRole);
    }
  }, [selectedRole]);

  // Current selected challenge object
  const currentChallenge = useMemo(() => {
    return CODING_CHALLENGES.find((c) => c.id === activeChallengeId) || CODING_CHALLENGES[0];
  }, [activeChallengeId]);

  // Load code for challenge (saved attempt, solved code, or starter code)
  useEffect(() => {
    if (!currentChallenge) return;
    const solvedData = solvedChallenges[currentChallenge.id];
    const savedAttempt = challengeAttempts[currentChallenge.id];

    if (solvedData?.code) {
      setCode(solvedData.code);
    } else if (savedAttempt) {
      setCode(savedAttempt);
    } else {
      setCode(currentChallenge.starterCode);
    }

    setTestResults(null);
    setConsoleLogs(null);
    setExecutionMode(null);
    setRevealedHints(0);
    setSolutionRevealed(false);
    setActiveTab("problem");
  }, [activeChallengeId, currentChallenge, solvedChallenges, challengeAttempts]);

  // Filter challenges by role, difficulty, status, and search query
  const filteredChallenges = useMemo(() => {
    return CODING_CHALLENGES.filter((challenge) => {
      // Role filter
      if (activeRole !== "all") {
        if (!challenge.roles.includes(activeRole)) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && challenge.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      const isSolved = Boolean(solvedChallenges[challenge.id]);
      if (selectedStatus === "solved" && !isSolved) return false;
      if (selectedStatus === "unsolved" && isSolved) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = challenge.title.toLowerCase().includes(q);
        const matchesCompany = challenge.companyTags.some((c) => c.toLowerCase().includes(q));
        const matchesCategory = challenge.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesCategory) return false;
      }

      return true;
    });
  }, [activeRole, selectedDifficulty, selectedStatus, searchQuery, solvedChallenges]);

  // Open question to solve
  const handleSelectChallenge = (id: string) => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    setActiveChallengeId(id);
    setViewMode("solve");
  };

  // Handle Code Change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (currentChallenge) {
      saveChallengeAttempt(currentChallenge.id, newCode);
    }
  };

  // Reset Code to Starter Code
  const handleResetCode = () => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode);
      saveChallengeAttempt(currentChallenge.id, currentChallenge.starterCode);
      setTestResults(null);
      setConsoleLogs(null);
      setExecutionMode(null);
    }
  };

  // Core Test Suite Runner (Used for Submitting Solution)
  const runTestSuite = async () => {
    if (!currentChallenge) return { results: [], allPassed: false };

    await new Promise((r) => setTimeout(r, 50));

    const results: TestResult[] = [];
    let allPassed = true;

    for (const tc of currentChallenge.testCases) {
      const startTime = performance.now();
      try {
        const wrappedCode = `${code}\n\nreturn (${tc.input});`;
        const runner = new Function("console", "setTimeout", "queueMicrotask", wrappedCode);
        const rawResult = runner(
          { log: () => {}, warn: () => {}, error: () => {} },
          setTimeout,
          queueMicrotask
        );

        const actualVal = rawResult instanceof Promise ? await rawResult : rawResult;
        const endTime = performance.now();

        const normalizedActual = typeof actualVal === "string" ? actualVal : JSON.stringify(actualVal);
        const normalizedExpected = tc.expectedOutput;

        const isPass = normalizedActual === normalizedExpected;
        if (!isPass) allPassed = false;

        results.push({
          description: tc.description,
          input: tc.input,
          expected: normalizedExpected,
          actual: normalizedActual ?? "undefined",
          passed: isPass,
          timeMs: Math.round((endTime - startTime) * 10) / 10,
        });
      } catch (err: any) {
        const endTime = performance.now();
        allPassed = false;
        results.push({
          description: tc.description,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: "Error: " + (err?.message || String(err)),
          passed: false,
          timeMs: Math.round((endTime - startTime) * 10) / 10,
          error: err?.message || String(err),
        });
      }
    }

    return { results, allPassed };
  };

  // Run Code (Executes code and captures Console Output)
  const handleRunCode = async () => {
    if (!currentChallenge || isRunning || isSubmitting) return;
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    setIsRunning(true);
    setTestResults(null);
    setConsoleLogs(null);
    setExecutionMode("run");

    await new Promise((r) => setTimeout(r, 50));

    const logs: ConsoleOutputLine[] = [];

    const formatArg = (arg: any): string => {
      if (arg === undefined) return "undefined";
      if (arg === null) return "null";
      if (typeof arg === "string") return arg;
      if (typeof arg === "function") return arg.toString();
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    };

    const customConsole = {
      log: (...args: any[]) => logs.push({ type: "log", text: args.map(formatArg).join(" ") }),
      warn: (...args: any[]) => logs.push({ type: "warn", text: args.map(formatArg).join(" ") }),
      error: (...args: any[]) => logs.push({ type: "error", text: args.map(formatArg).join(" ") }),
      info: (...args: any[]) => logs.push({ type: "info", text: args.map(formatArg).join(" ") }),
    };

    const startTime = performance.now();

    try {
      // 1. Execute user top-level code & custom console log calls
      const runner = new Function("console", "setTimeout", "queueMicrotask", code);
      const topResult = runner(customConsole, setTimeout, queueMicrotask);

      if (topResult instanceof Promise) {
        await topResult;
      }

      // 2. Automatically evaluate sample test cases to show live returns in console
      for (let idx = 0; idx < currentChallenge.testCases.length; idx++) {
        const tc = currentChallenge.testCases[idx];
        try {
          const evalCode = `${code}\n\nreturn (${tc.input});`;
          const tcRunner = new Function("console", "setTimeout", "queueMicrotask", evalCode);
          const res = tcRunner(
            { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
            setTimeout,
            queueMicrotask
          );
          const resolved = res instanceof Promise ? await res : res;
          const formattedRes = typeof resolved === "string" ? `"${resolved}"` : JSON.stringify(resolved);
          logs.push({
            type: "system",
            text: `▶ Example ${idx + 1}: ${tc.input} => ${formattedRes ?? "undefined"}`,
          });
        } catch (err: any) {
          logs.push({
            type: "error",
            text: `▶ Example ${idx + 1}: ${tc.input} => Error: ${err?.message || String(err)}`,
          });
        }
      }

      const endTime = performance.now();
      setConsoleDuration(Math.round((endTime - startTime) * 10) / 10);
    } catch (err: any) {
      const endTime = performance.now();
      setConsoleDuration(Math.round((endTime - startTime) * 10) / 10);
      logs.push({
        type: "error",
        text: `Runtime Error: ${err?.message || String(err)}`,
      });
    }

    if (logs.length === 0) {
      logs.push({
        type: "system",
        text: "// Code executed successfully with zero console log statements.",
      });
    }

    setConsoleLogs(logs);
    setIsRunning(false);
  };

  // Submit Solution (Evaluates test cases and marks challenge solved if passed)
  const handleSubmitCode = async () => {
    if (!currentChallenge || isRunning || isSubmitting) return;
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    setIsSubmitting(true);
    setConsoleLogs(null);
    setTestResults(null);
    setExecutionMode("submit");

    const { results, allPassed } = await runTestSuite();

    setTestResults(results);
    setIsSubmitting(false);

    // Only mark solved and award points if submitted AND all test cases pass
    const isAlreadySolved = Boolean(solvedChallenges[currentChallenge.id]);
    if (allPassed && !isAlreadySolved) {
      markChallengeSolved(currentChallenge.id, code);
      setCelebrationPoints(currentChallenge.points);
      setShowCelebration(true);
    }
  };

  // Handle Role Change
  const handleRoleSelect = (roleId: string) => {
    setActiveRole(roleId);
    setSelectedRole(roleId);
  };

  // Prev / Next challenge navigation in solve mode
  const currentIdx = filteredChallenges.findIndex((c) => c.id === activeChallengeId);
  const prevChallenge = currentIdx > 0 ? filteredChallenges[currentIdx - 1] : null;
  const nextChallenge = currentIdx < filteredChallenges.length - 1 ? filteredChallenges[currentIdx + 1] : null;

  const pointsSummary = getPointsSummary();
  const codingPoints = pointsSummary.codingPoints || {
    totalCodingPoints: 0,
    solvedCount: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col p-3 sm:p-6 max-w-[1600px] mx-auto gap-4 sm:gap-6">
      {/* Victory Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-2 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">
                Passed & Solved
              </Badge>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{currentChallenge.title}</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6">
                All test cases passed cleanly! You earned{" "}
                <span className="text-emerald-400 font-bold">+{celebrationPoints} points</span>.
              </p>

              <Button
                onClick={() => setShowCelebration(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl h-10 sm:h-11 text-xs sm:text-sm"
              >
                Continue Practice
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: QUESTIONS LIST VIEW (Default - Shows list of questions first) */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Top Banner Overview */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-card border border-border/80 relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="border-border text-foreground bg-secondary/60 gap-1.5 px-2.5 py-0.5 text-[10px] sm:text-xs">
                  <Zap className="w-3.5 h-3.5" /> REAL-WORLD CODING ROUNDS
                </Badge>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interview Coding Practice
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-xl leading-relaxed">
                Master real FAANG interview questions tailored to your chosen career path. Click any question to open the VS Code practice workspace.
              </p>
            </div>

            {/* Quick Stats Pill Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 z-10">
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-black/40 border border-border/60 text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Total Solved</div>
                <div className="text-base sm:text-xl font-bold text-white flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  {codingPoints.solvedCount} / {CODING_CHALLENGES.length}
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-black/40 border border-border/60 text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Coding Points</div>
                <div className="text-base sm:text-xl font-bold text-white flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  +{codingPoints.totalCodingPoints}
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-black/40 border border-border/60 text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Easy / Med / Hard</div>
                <div className="text-[10px] sm:text-xs font-semibold text-white mt-1 flex items-center justify-center gap-1.5">
                  <span className="text-emerald-400">{codingPoints.easySolved}E</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-amber-400">{codingPoints.mediumSolved}M</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-red-400">{codingPoints.hardSolved}H</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-black/40 border border-border/60 text-center flex flex-col justify-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Active Path</div>
                <div className="text-[11px] sm:text-xs font-semibold text-white truncate">
                  {ROLES.find((r) => r.id === activeRole)?.shortTitle || "All Topics"}
                </div>
              </div>
            </div>
          </div>

          {/* Role Path Selector Toolbar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/60 flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-foreground shrink-0" /> Target Career Path
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                Showing {filteredChallenges.length} role-specific questions
              </span>
            </div>

            {/* Mobile Career Path Select Dropdown (< sm) */}
            <div className="sm:hidden w-full">
              <Select value={activeRole} onValueChange={(val: any) => { if (val) handleRoleSelect(val); }}>
                <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="w-4 h-4 text-foreground shrink-0" />
                    <span className="truncate">
                      Path: {ROLES.find((r) => r.id === activeRole)?.shortTitle || "All Career Paths"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border border-border text-foreground rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  {ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-xs font-medium cursor-pointer py-2.5 px-3 rounded-lg">
                      <span>{role.shortTitle}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Career Path Button Pills (>= sm) */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {ROLES.map((role) => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-white text-black border-white font-semibold shadow-md"
                        : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-white"
                    }`}
                  >
                    {role.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters Bar: Search & Difficulty & Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-card/60 border border-border/80 rounded-2xl">
            {/* Search Input */}
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/50 border-border/60 rounded-xl text-xs h-9"
              />
            </div>

            {/* Mobile Filters Select Dropdowns (< sm) */}
            <div className="sm:hidden grid grid-cols-2 gap-2 w-full">
              <Select value={selectedDifficulty} onValueChange={(val: any) => { if (val) setSelectedDifficulty(val); }}>
                <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs shadow-sm flex items-center justify-between">
                  <span className="truncate">Diff: {selectedDifficulty === "all" ? "All" : selectedDifficulty}</span>
                </SelectTrigger>
                <SelectContent className="bg-card border border-border text-foreground rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  {["all", "Easy", "Medium", "Hard"].map((diff) => (
                    <SelectItem key={diff} value={diff} className="text-xs font-medium cursor-pointer py-2.5 px-3 rounded-lg">
                      <span>{diff === "all" ? "All Difficulties" : diff}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(val: any) => { if (val) setSelectedStatus(val); }}>
                <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs shadow-sm flex items-center justify-between">
                  <span className="truncate capitalize">Status: {selectedStatus}</span>
                </SelectTrigger>
                <SelectContent className="bg-card border border-border text-foreground rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  {["all", "unsolved", "solved"].map((st) => (
                    <SelectItem key={st} value={st} className="text-xs font-medium cursor-pointer py-2.5 px-3 rounded-lg capitalize">
                      <span>{st === "all" ? "All Status" : st}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Filter Buttons (>= sm) */}
            <div className="hidden sm:flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Difficulty:</span>
                {["all", "Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs transition-all border ${
                      selectedDifficulty === diff
                        ? "bg-white text-black border-white font-semibold"
                        : "bg-secondary/30 text-muted-foreground border-border/40 hover:bg-secondary/60 hover:text-white"
                    }`}
                  >
                    {diff === "all" ? "All" : diff}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-border shrink-0" />

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Status:</span>
                {["all", "unsolved", "solved"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs transition-all capitalize border ${
                      selectedStatus === st
                        ? "bg-white text-black border-white font-semibold"
                        : "bg-secondary/30 text-muted-foreground border-border/40 hover:bg-secondary/60 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredChallenges.length === 0 ? (
              <div className="col-span-full p-8 sm:p-12 text-center bg-card/40 border border-border/40 rounded-3xl text-muted-foreground text-xs sm:text-sm">
                No coding questions match your current search and role filters.
              </div>
            ) : (
              filteredChallenges.map((challenge) => {
                const isSolved = Boolean(solvedChallenges[challenge.id]);

                return (
                  <div
                    key={challenge.id}
                    onClick={() => handleSelectChallenge(challenge.id)}
                    className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-white/60 transition-all duration-100 ease-out hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-3.5 group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 border ${
                              challenge.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : challenge.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors line-clamp-1">
                        {challenge.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 truncate min-w-0">
                        <span className="bg-secondary px-2 py-0.5 rounded text-[10px] text-foreground font-mono shrink-0">
                          {challenge.category}
                        </span>
                        {challenge.companyTags.slice(0, 2).map((comp) => (
                          <span key={comp} className="text-muted-foreground text-[10px] truncate">
                            • {comp}
                          </span>
                        ))}
                      </div>

                      <span className="text-xs font-semibold text-white group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                        Solve <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: QUESTION SOLVING WORKSPACE (Appears when user clicks question) */}
      {/* ========================================================================= */}
      {viewMode === "solve" && (
        <div className="flex flex-col gap-6">
          {/* Top Bar with Back Button & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-xs border-border text-foreground hover:bg-secondary gap-1.5 h-8.5 px-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Questions
              </Button>

              <div className="h-4 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-[10px] sm:text-xs px-2 py-0.5 border ${
                    currentChallenge.difficulty === "Easy"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : currentChallenge.difficulty === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {currentChallenge.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono px-2 py-0.5">
                  {currentChallenge.category}
                </Badge>
                {solvedChallenges[currentChallenge.id] && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] sm:text-xs gap-1 px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Solved
                  </Badge>
                )}
              </div>
            </div>

            {/* Prev / Next Challenge Navigation */}
            <div className="flex items-center gap-2">
              {prevChallenge && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveChallengeId(prevChallenge.id)}
                  className="text-xs text-muted-foreground hover:text-white hover:bg-secondary gap-1 h-8 px-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Button>
              )}
              {nextChallenge && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveChallengeId(nextChallenge.id)}
                  className="text-xs text-muted-foreground hover:text-white hover:bg-secondary gap-1 h-8 px-2.5"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Main Problem & VS Code Editor Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left Column: Question Details & Test Cases (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Card className="p-4 sm:p-6 bg-card border-border/80 rounded-3xl flex flex-col gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    {currentChallenge.title}
                  </h2>

                  {/* Company Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Asked at:
                    </span>
                    {currentChallenge.companyTags.map((comp) => (
                      <span
                        key={comp}
                        className="text-[10px] sm:text-xs bg-secondary/60 text-foreground px-2 py-0.5 rounded-lg border border-border/60 font-medium"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile Description / Hints / Solution Select Dropdown (< sm) */}
                <div className="sm:hidden w-full pb-1">
                  <Select value={activeTab} onValueChange={(val: any) => { if (val) setActiveTab(val); }}>
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {activeTab === "problem" && <BookOpen className="w-4 h-4 text-foreground shrink-0" />}
                        {activeTab === "hints" && <Lightbulb className="w-4 h-4 text-foreground shrink-0" />}
                        {activeTab === "solution" && <Eye className="w-4 h-4 text-foreground shrink-0" />}
                        <span className="truncate">
                          {activeTab === "problem" && "Problem Description"}
                          {activeTab === "hints" && `Hints (${currentChallenge.hints.length})`}
                          {activeTab === "solution" && "Solution Code"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border text-foreground rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                      <SelectItem value="problem" className="text-xs font-medium cursor-pointer py-2.5 px-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>Problem Description</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hints" className="text-xs font-medium cursor-pointer py-2.5 px-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-muted-foreground" />
                          <span>Hints ({currentChallenge.hints.length})</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="solution" className="text-xs font-medium cursor-pointer py-2.5 px-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>Solution Code</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop Description / Hints / Solution Tabs (>= sm) */}
                <div className="hidden sm:flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto custom-scrollbar">
                  <button
                    onClick={() => setActiveTab("problem")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 ${
                      activeTab === "problem"
                        ? "bg-white text-black border-white shadow"
                        : "text-muted-foreground border-transparent hover:text-white"
                    }`}
                  >
                    Problem Description
                  </button>
                  <button
                    onClick={() => setActiveTab("hints")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 ${
                      activeTab === "hints"
                        ? "bg-white text-black border-white shadow"
                        : "text-muted-foreground border-transparent hover:text-white"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Hints ({currentChallenge.hints.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("solution")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0 ${
                      activeTab === "solution"
                        ? "bg-white text-black border-white shadow"
                        : "text-muted-foreground border-transparent hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Solution Code
                  </button>
                </div>

                {/* Tab Contents */}
                {activeTab === "problem" && (
                  <div className="space-y-4">
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {currentChallenge.description}
                    </p>

                    {/* Test Case Preview */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Example Test Cases
                      </h4>
                      <div className="space-y-2">
                        {currentChallenge.testCases.map((tc, idx) => (
                          <div key={idx} className="p-3 bg-black/50 rounded-xl border border-border/60 font-mono text-xs space-y-1">
                            <div className="text-muted-foreground text-[10px]">{tc.description}</div>
                            <div>
                              <span className="text-muted-foreground">Input:</span> <span className="text-white">{tc.input}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected:</span> <span className="text-white">{tc.expectedOutput}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "hints" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white">Progressive Hints</h4>
                    <div className="space-y-3">
                      {currentChallenge.hints.map((hint, idx) => {
                        const isRevealed = idx < revealedHints;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                              isRevealed
                                ? "bg-secondary/40 border-border text-foreground"
                                : "bg-secondary/20 border-border/40 text-muted-foreground text-center"
                            }`}
                          >
                            {isRevealed ? (
                              <div className="flex items-start gap-2 text-xs">
                                <Lightbulb className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                                <span>
                                  <strong>Hint {idx + 1}:</strong> {hint}
                                </span>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRevealedHints((prev) => Math.max(prev, idx + 1))}
                                className="text-xs text-foreground hover:bg-secondary/60"
                              >
                                Reveal Hint #{idx + 1}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "solution" && (
                  <div className="space-y-4">
                    {!solutionRevealed ? (
                      <div className="p-8 text-center bg-secondary/20 border border-border/60 rounded-2xl space-y-3">
                        <Eye className="w-8 h-8 text-muted-foreground mx-auto" />
                        <h4 className="text-sm font-bold text-white">Reveal Reference Solution</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Try solving the problem yourself first! Viewing the solution will reveal the optimal reference code.
                        </p>
                        <Button
                          onClick={() => setSolutionRevealed(true)}
                          className="bg-white text-black hover:bg-white/90 font-semibold text-xs px-6 rounded-xl"
                        >
                          Show Solution Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Optimal Reference Solution</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCode(currentChallenge.solution);
                              saveChallengeAttempt(currentChallenge.id, currentChallenge.solution);
                            }}
                            className="text-xs text-muted-foreground hover:text-white hover:bg-secondary/60"
                          >
                            Copy Solution to Editor
                          </Button>
                        </div>
                        <pre className="p-4 bg-black/90 rounded-xl border border-border text-xs font-mono text-white overflow-x-auto">
                          {currentChallenge.solution}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: VS Code Editor & Test Case Execution Output (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Card className="p-5 bg-card border-border/80 rounded-3xl flex flex-col gap-4">
                {/* VS Code Editor Component */}
                <VSCodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  fileName={`${currentChallenge.id}.js`}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  onReset={handleResetCode}
                  minHeight="360px"
                />

                {/* Console Output Panel (Run Mode) */}
                {executionMode === "run" && consoleLogs && (
                  <div className="space-y-3 pt-4 border-t border-border/60 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Console Output
                        </h4>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          Terminal
                        </Badge>
                      </div>
                      {consoleDuration !== null && (
                        <span className="text-[10px] text-muted-foreground">{consoleDuration}ms</span>
                      )}
                    </div>

                    {/* Console Window Terminal */}
                    <div className="w-full max-h-[300px] overflow-y-auto bg-[#050505] p-4 rounded-2xl border border-border/80 text-foreground font-mono space-y-1.5 shadow-inner custom-scrollbar">
                      {consoleLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={`leading-relaxed whitespace-pre-wrap ${
                            log.type === "error"
                              ? "text-red-400 font-semibold"
                              : log.type === "warn"
                              ? "text-amber-400"
                              : log.type === "system"
                              ? "text-emerald-400 font-medium"
                              : "text-zinc-200"
                          }`}
                        >
                          {log.text}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-secondary/40 border border-border/60 rounded-xl text-xs text-muted-foreground flex items-center justify-between gap-2">
                      <span>Ready to test against test cases and claim points?</span>
                      <Button
                        size="sm"
                        onClick={handleSubmitCode}
                        disabled={isSubmitting}
                        className="bg-emerald-500 text-black hover:bg-emerald-600 font-bold h-7 text-xs px-3 rounded-lg shrink-0 shadow-sm"
                      >
                        Submit Solution
                      </Button>
                    </div>
                  </div>
                )}

                {/* Test Results Output Panel (Submit Mode) */}
                {executionMode === "submit" && testResults && (
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Submission Test Results
                        </h4>
                        <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground uppercase">
                          Test Suite
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2.5 py-0.5 border ${
                          testResults.every((t) => t.passed)
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        }`}
                      >
                        {testResults.filter((t) => t.passed).length} / {testResults.length} Passed
                      </Badge>
                    </div>

                    {executionMode === "submit" && testResults.some((t) => !t.passed) && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
                        Submission incomplete: {testResults.filter((t) => !t.passed).length} test case(s) failed. Fix the issues below and submit again.
                      </div>
                    )}

                    <div className="space-y-2">
                      {testResults.map((res, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border font-mono text-xs transition-all ${
                            res.passed
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-red-500/10 border-red-500/30 text-red-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 font-semibold">
                              {res.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                              )}
                              <span>Test #{idx + 1}: {res.description}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{res.timeMs}ms</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/30 text-[11px]">
                            <div>
                              <span className="text-muted-foreground">Input: </span>
                              <span className="text-white">{res.input}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected: </span>
                              <span className="text-white">{res.expected}</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-muted-foreground">Actual Output: </span>
                              <span className={res.passed ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                {res.actual}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Auth Gate Modal for Unauthenticated Practice Actions */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in for Coding Practice"
        description="Please sign in or create a free account to solve interview coding challenges, run code in the editor, and earn practice points."
        badge="Coding Arena Access"
      />
    </div>
  );
}

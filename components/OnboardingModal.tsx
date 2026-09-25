"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { ROLES } from "@/data/roles";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Layout,
  Server,
  Layers,
  Database,
  BarChart3,
  Cpu,
  Binary,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Briefcase,
  Code2,
  Rocket,
  GraduationCap,
  Zap,
  Sprout,
  TreeDeciduous,
  Search,
  Share2,
  Users,
  Megaphone,
  HelpCircle,
  AtSign,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { triggerHaptic } from "@/lib/haptics";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  all: <Globe className="w-5 h-5 text-foreground" />,
  frontend: <Layout className="w-5 h-5 text-foreground" />,
  backend: <Server className="w-5 h-5 text-foreground" />,
  fullstack: <Layers className="w-5 h-5 text-foreground" />,
  "data-engineer": <Database className="w-5 h-5 text-foreground" />,
  "data-analytics": <BarChart3 className="w-5 h-5 text-foreground" />,
  "devops-architect": <Cpu className="w-5 h-5 text-foreground" />,
  dsa: <Binary className="w-5 h-5 text-foreground" />,
};

const GOAL_OPTIONS = [
  {
    id: "learn",
    title: "Learn & Master Concepts",
    subtitle: "Explore comprehensive documentation and topic guides",
    icon: <BookOpen className="w-5 h-5 text-foreground" />,
  },
  {
    id: "interview",
    title: "Prepare for Tech Interviews",
    subtitle: "Practice coding & system design interview questions",
    icon: <Briefcase className="w-5 h-5 text-foreground" />,
  },
  {
    id: "coding",
    title: "Practice Live Coding",
    subtitle: "Solve real-world coding problems in the arena",
    icon: <Code2 className="w-5 h-5 text-foreground" />,
  },
  {
    id: "upskill",
    title: "Level Up Senior Skills",
    subtitle: "Deep dive into scalable architectures & protocols",
    icon: <Rocket className="w-5 h-5 text-foreground" />,
  },
  {
    id: "academic",
    title: "CS Studies & Academics",
    subtitle: "University coursework & computer science basics",
    icon: <GraduationCap className="w-5 h-5 text-foreground" />,
  },
  {
    id: "reference",
    title: "Quick Reference & Cheat Sheets",
    subtitle: "Daily developer lookups on the job",
    icon: <Zap className="w-5 h-5 text-foreground" />,
  },
];

const LEVEL_OPTIONS = [
  {
    id: "beginner",
    title: "Beginner (0-1 yrs)",
    subtitle: "Learning fundamentals and building first web apps",
    icon: <Sprout className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "intermediate",
    title: "Junior / Mid-level (1-3 yrs)",
    subtitle: "Expanding full-stack skills and writing production code",
    icon: <Target className="w-5 h-5 text-sky-400" />,
  },
  {
    id: "senior",
    title: "Senior Developer (3-5+ yrs)",
    subtitle: "Designing architecture, system design & lead projects",
    icon: <TreeDeciduous className="w-5 h-5 text-amber-400" />,
  },
  {
    id: "polyglot",
    title: "Tech Lead / Veteran",
    subtitle: "Experienced engineer mastering new stacks & domains",
    icon: <Zap className="w-5 h-5 text-purple-400" />,
  },
];

const SOURCE_OPTIONS = [
  {
    id: "github",
    title: "GitHub / Open Source",
    icon: <FaGithub className="w-5 h-5 text-foreground" />,
  },
  {
    id: "google",
    title: "Google / Search Engine",
    icon: <Search className="w-5 h-5 text-foreground" />,
  },
  {
    id: "social",
    title: "Social Media (X / LinkedIn / Reddit)",
    icon: <Share2 className="w-5 h-5 text-foreground" />,
  },
  {
    id: "recommendation",
    title: "Friend or Colleague Recommendation",
    icon: <Users className="w-5 h-5 text-foreground" />,
  },
  {
    id: "blog",
    title: "Tech Blogs, YouTube or Newsletters",
    icon: <Megaphone className="w-5 h-5 text-foreground" />,
  },
  {
    id: "other",
    title: "Other",
    icon: <HelpCircle className="w-5 h-5 text-foreground" />,
  },
];

export function OnboardingModal() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const selectedRole = useStudyStore((state) => state.selectedRole);
  const setSelectedRole = useStudyStore((state) => state.setSelectedRole);
  const hasCompletedOnboarding = useStudyStore((state) => state.hasCompletedOnboarding);
  const setCompletedOnboarding = useStudyStore((state) => state.setCompletedOnboarding);
  const isOnboardingOpen = useStudyStore((state) => state.isOnboardingOpen);
  const setOnboardingOpen = useStudyStore((state) => state.setOnboardingOpen);
  const isCloudFetched = useStudyStore((state) => state.isCloudFetched);

  const shouldShow =
    isLoaded &&
    (isOnboardingOpen || (isSignedIn && isCloudFetched && !hasCompletedOnboarding));

  // Determine if user needs to choose a username (e.g. Google OAuth user without username)
  const needsUsername = Boolean(isSignedIn && user && !user.username);
  const totalSteps = needsUsername ? 5 : 4;

  const [step, setStep] = useState<number>(1);
  const [chosenRole, setChosenRole] = useState<string>(selectedRole || "all");
  const [chosenGoal, setChosenGoal] = useState<string>("learn");
  const [chosenLevel, setChosenLevel] = useState<string>("intermediate");
  const [chosenSource, setChosenSource] = useState<string>("github");

  // Custom username state for onboarding
  const [customUsername, setCustomUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);

  useEffect(() => {
    if (user && !customUsername) {
      const initialName =
        user.username ||
        user.firstName?.toLowerCase() ||
        user.primaryEmailAddress?.emailAddress.split("@")[0] ||
        "";
      setCustomUsername(initialName.toLowerCase().replace(/[^a-z0-9_]/g, ""));
    }
  }, [user, customUsername]);

  if (!shouldShow) return null;

  const handleNextStep = async () => {
    triggerHaptic("light");

    // Handle Username Step Validation & Saving if required
    if (needsUsername && step === 1) {
      const cleaned = customUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (!cleaned || cleaned.length < 3) {
        setUsernameError("Username must be at least 3 characters (letters, numbers, underscores).");
        return;
      }

      if (cleaned.length > 20) {
        setUsernameError("Username must be 20 characters or less.");
        return;
      }

      setIsSavingUsername(true);
      setUsernameError("");

      try {
        if (user) {
          await user.update({ username: cleaned });
        }
        setStep(step + 1);
      } catch (err: any) {
        console.error("Failed to update username:", err);
        const msg = err?.errors?.[0]?.message || "Username is already taken or invalid. Please try another handle.";
        setUsernameError(msg);
      } finally {
        setIsSavingUsername(false);
      }
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    triggerHaptic("light");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    triggerHaptic("success");
    setSelectedRole(chosenRole);
    setCompletedOnboarding({
      goal: chosenGoal,
      level: chosenLevel,
      source: chosenSource,
      username: customUsername || undefined,
    });
    setOnboardingOpen(false);
  };

  const handleSkip = () => {
    triggerHaptic("light");
    setSelectedRole(chosenRole || "all");
    setCompletedOnboarding();
    setOnboardingOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-normal"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        >
          {/* Top Progress Bar Header */}
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span>Developer Onboarding</span>
              <span className="text-foreground font-mono">({step}/{totalSteps})</span>
            </div>

            <div className="w-36 h-2 bg-secondary rounded-full overflow-hidden border border-border">
              <motion.div
                initial={{ width: "20%" }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-foreground rounded-full"
              />
            </div>
          </div>

          {/* Modal Body with Step Transitions */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
            <AnimatePresence mode="wait">
              {/* ==============================================================
                  STEP: CHOOSE DEVELOPER HANDLE / USERNAME (If missing)
                  ============================================================== */}
              {needsUsername && step === 1 && (
                <motion.div
                  key="stepUsername"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs font-semibold text-foreground mb-1">
                      <UserIcon className="w-3.5 h-3.5 text-foreground" />
                      <span>Profile Setup</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Choose Your Developer Handle
                    </h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Pick a unique username for the global developer leaderboard and your study profile.
                    </p>
                  </div>

                  <div className="bg-secondary/20 border border-border rounded-2xl p-5 sm:p-6 space-y-4 max-w-lg">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Developer Username <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <AtSign className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="alex_dev"
                          value={customUsername}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                            setCustomUsername(val);
                            if (usernameError) setUsernameError("");
                          }}
                          className="bg-secondary/40 border-border text-foreground pl-10 rounded-xl h-11 text-sm font-medium focus:border-foreground font-mono"
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Your handle will appear as <strong className="text-foreground">@{customUsername || "handle"}</strong> on global rankings.
                      </p>
                    </div>

                    {usernameError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                        {usernameError}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ==============================================================
                  STEP: CHOOSE TARGET ROLE
                  ============================================================== */}
              {(needsUsername ? step === 2 : step === 1) && (
                <motion.div
                  key="stepRole"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Choose Your Target Role
                    </h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Select your primary engineering domain to focus your curriculum and roadmap.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROLES.map((role) => {
                      const isSelected = chosenRole === role.id;

                      return (
                        <motion.button
                          key={role.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            triggerHaptic("light");
                            setChosenRole(role.id);
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${isSelected
                              ? "bg-secondary border-foreground text-foreground shadow-sm font-semibold ring-1 ring-foreground/20"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                              {ROLE_ICONS[role.id] || <Target className="w-4 h-4 text-foreground" />}
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                              {role.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold hidden xs:inline-flex">
                              {role.badge}
                            </Badge>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 text-background stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ==============================================================
                  STEP: WHAT ARE YOU HERE FOR? (PRIMARY GOAL)
                  ============================================================== */}
              {(needsUsername ? step === 3 : step === 2) && (
                <motion.div
                  key="stepGoal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      What are you here for?
                    </h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Let us know your primary objective so we can customize your study workspace.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GOAL_OPTIONS.map((goal) => {
                      const isSelected = chosenGoal === goal.id;

                      return (
                        <motion.button
                          key={goal.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            triggerHaptic("light");
                            setChosenGoal(goal.id);
                          }}
                          className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${isSelected
                              ? "bg-secondary border-foreground text-foreground shadow-sm ring-1 ring-foreground/20"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="p-2.5 rounded-xl bg-secondary border border-border shrink-0">
                              {goal.icon}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                                {goal.title}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate font-normal">
                                {goal.subtitle}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-background stroke-[3]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ==============================================================
                  STEP: EXPERIENCE LEVEL
                  ============================================================== */}
              {(needsUsername ? step === 4 : step === 3) && (
                <motion.div
                  key="stepLevel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      What is your experience level?
                    </h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      We&apos;ll tailor the topic depth and interview complexity to your background.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LEVEL_OPTIONS.map((lvl) => {
                      const isSelected = chosenLevel === lvl.id;

                      return (
                        <motion.button
                          key={lvl.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            triggerHaptic("light");
                            setChosenLevel(lvl.id);
                          }}
                          className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${isSelected
                              ? "bg-secondary border-foreground text-foreground shadow-sm ring-1 ring-foreground/20"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="p-2.5 rounded-xl bg-secondary border border-border shrink-0">
                              {lvl.icon}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                                {lvl.title}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate font-normal">
                                {lvl.subtitle}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-background stroke-[3]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ==============================================================
                  STEP: HOW DID YOU HEAR ABOUT US?
                  ============================================================== */}
              {(needsUsername ? step === 5 : step === 4) && (
                <motion.div
                  key="stepSource"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      How did you hear about us?
                    </h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Let us know where you discovered Better DevDocs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOURCE_OPTIONS.map((src) => {
                      const isSelected = chosenSource === src.id;

                      return (
                        <motion.button
                          key={src.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            triggerHaptic("light");
                            setChosenSource(src.id);
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${isSelected
                              ? "bg-secondary border-foreground text-foreground shadow-sm ring-1 ring-foreground/20"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-secondary border border-border shrink-0">
                              {src.icon}
                            </div>
                            <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                              {src.title}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-background stroke-[3]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-border bg-card flex items-center justify-between gap-3">
            <div>
              {step > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  disabled={isSavingUsername}
                  className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isSavingUsername}
                  className="text-xs text-muted-foreground hover:text-foreground font-normal cursor-pointer"
                >
                  Skip Setup
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleNextStep}
                disabled={isSavingUsername}
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs h-9 px-4 sm:px-6 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isSavingUsername ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Handle...</span>
                  </>
                ) : (
                  <>
                    <span>{step === totalSteps ? "Complete Setup" : "Continue"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

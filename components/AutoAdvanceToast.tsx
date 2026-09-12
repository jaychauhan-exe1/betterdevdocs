"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, X } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export function AutoAdvanceToast() {
  const autoAdvanceToast = useStudyStore((state) => state.autoAdvanceToast);
  const clearAutoAdvanceToast = useStudyStore((state) => state.clearAutoAdvanceToast);
  const setActiveTopicId = useStudyStore((state) => state.setActiveTopicId);

  const router = useRouter();
  const pathname = usePathname();

  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleNextImmediately = () => {
    if (!autoAdvanceToast) return;
    triggerHaptic("medium");
    const targetId = autoAdvanceToast.targetTopicId;
    clearAutoAdvanceToast();
    setActiveTopicId(targetId);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleDismiss = () => {
    triggerHaptic("light");
    clearAutoAdvanceToast();
  };

  useEffect(() => {
    if (!autoAdvanceToast) {
      setTimeLeft(5);
      return;
    }

    setTimeLeft(5);

    // Countdown interval for numerical display (5, 4, 3, 2, 1)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto navigate after exactly 5000ms
    timerRef.current = setTimeout(() => {
      triggerHaptic("medium");
      const targetId = autoAdvanceToast.targetTopicId;
      clearAutoAdvanceToast();
      setActiveTopicId(targetId);
      if (pathname !== "/") {
        router.push("/");
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoAdvanceToast?.timestamp, autoAdvanceToast?.targetTopicId, clearAutoAdvanceToast, setActiveTopicId, pathname, router]);

  return (
    <AnimatePresence>
      {autoAdvanceToast && (
        <motion.div
          key={autoAdvanceToast.timestamp}
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-lg font-sans pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-4 flex items-center justify-between gap-3 sm:gap-4">
            {/* Animated 5-Second Shrinking Progress Bar at Bottom */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-foreground origin-left"
            />

            {/* Left Content: Checkmark & Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Topic Mastered!
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                    Next in {timeLeft}s
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate mt-0.5">
                  Next: {autoAdvanceToast.targetTopicTitle}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={handleNextImmediately}
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs h-9 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Next Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                title="Stay on current topic"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

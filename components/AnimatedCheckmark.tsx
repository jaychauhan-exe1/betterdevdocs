"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface AnimatedCheckmarkProps {
  checked: boolean;
  onToggle?: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

const CELEBRATION_COLORS = [
  "var(--confetti-emerald)",
  "var(--confetti-blue)",
  "var(--confetti-purple)",
  "var(--confetti-amber)",
  "var(--confetti-pink)",
  "var(--confetti-cyan)",
  "var(--confetti-indigo)",
  "var(--confetti-emerald)",
];

export function AnimatedCheckmark({
  checked,
  onToggle,
  size = 18,
  className = "",
}: AnimatedCheckmarkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!onToggle) return;
    e.stopPropagation();
    triggerHaptic(checked ? "light" : "celebrate");
    onToggle(e);
  };

  return (
    <motion.div
      onClick={onToggle ? handleClick : undefined}
      whileHover={onToggle ? { scale: 1.18 } : undefined}
      whileTap={onToggle ? { scale: 0.85 } : undefined}
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${
        onToggle ? "cursor-pointer" : "pointer-events-none"
      } ${className}`}
      style={{ width: size, height: size }}
      role={onToggle ? "checkbox" : undefined}
      aria-checked={checked}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {checked ? (
          <motion.div
            key="checked"
            initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.08, ease: "easeIn" } }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 20,
            }}
            className="relative w-full h-full rounded-md bg-foreground text-background flex items-center justify-center shadow-md"
          >
            {/* Glowing Celebration Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-0 rounded-md bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 blur-sm pointer-events-none"
            />

            {/* Particle Confetti Bursts */}
            {CELEBRATION_COLORS.map((color, index) => {
              const angle = (index / CELEBRATION_COLORS.length) * (2 * Math.PI);
              const distance = size * 1.4;
              const targetX = Math.cos(angle) * distance;
              const targetY = Math.sin(angle) * distance;

              return (
                <motion.span
                  key={index}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: [0, 1.2, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 0.55,
                    ease: "easeOut",
                    delay: 0.03 * index,
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full pointer-events-none z-20"
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Animated Checkmark SVG Path */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-background relative z-10"
            >
              <motion.path
                d="M20 6L9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 25,
                  delay: 0.05,
                }}
              />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="unchecked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.08 } }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            className="w-full h-full rounded-md border-2 border-muted-foreground/60 hover:border-foreground transition-colors bg-transparent"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

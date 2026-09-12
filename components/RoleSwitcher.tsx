"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROLES } from "@/data/roles";
import { useStudyStore } from "@/store/useStudyStore";
import {
  Globe,
  Layout,
  Server,
  Layers,
  Database,
  BarChart3,
  Cpu,
  Binary,
  ChevronDown,
  Check,
  Target,
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  all: <Globe className="w-4 h-4 text-foreground" />,
  frontend: <Layout className="w-4 h-4 text-foreground" />,
  backend: <Server className="w-4 h-4 text-foreground" />,
  fullstack: <Layers className="w-4 h-4 text-foreground" />,
  "data-engineer": <Database className="w-4 h-4 text-foreground" />,
  "data-analytics": <BarChart3 className="w-4 h-4 text-foreground" />,
  "devops-architect": <Cpu className="w-4 h-4 text-foreground" />,
  dsa: <Binary className="w-4 h-4 text-foreground" />,
};

export function RoleSwitcher() {
  const selectedRole = useStudyStore((state) => state.selectedRole);
  const setSelectedRole = useStudyStore((state) => state.setSelectedRole);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeRole =
    ROLES.find((r) => r.id === selectedRole) || ROLES[0]; // default All

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    triggerHaptic("light");
    setIsOpen(!isOpen);
  };

  const handleSelect = (roleId: string) => {
    triggerHaptic("success");
    setSelectedRole(roleId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full font-normal">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle}
        className="w-full p-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 flex items-center justify-between gap-3 text-left transition-colors group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
            {ROLE_ICONS[activeRole.id] || <Target className="w-4 h-4 text-foreground" />}
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block leading-none mb-0.5">
              Focus Track
            </span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {activeRole.shortTitle}
            </span>
          </div>
        </div>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-border bg-card shadow-2xl p-1.5 space-y-1 max-h-80 overflow-y-auto custom-scrollbar font-normal"
          >
            <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/50">
              Select Your Learning Track
            </div>

            {ROLES.map((role) => {
              const isSelected = activeRole.id === role.id;

              return (
                <motion.button
                  key={role.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(role.id)}
                  className={`w-full p-2.5 rounded-xl flex items-start justify-between gap-3 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-secondary text-foreground font-semibold border border-border/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      {ROLE_ICONS[role.id] || <Target className="w-4 h-4" />}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        <span>{role.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2 font-normal">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-foreground flex-shrink-0 mt-1" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

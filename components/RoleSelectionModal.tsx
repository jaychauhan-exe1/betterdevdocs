"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { ROLES } from "@/data/roles";
import { useStudyStore } from "@/store/useStudyStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
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

export function RoleSelectionModal() {
  const { isSignedIn, isLoaded } = useAuth();
  const selectedRole = useStudyStore((state) => state.selectedRole);
  const setSelectedRole = useStudyStore((state) => state.setSelectedRole);
  const topics = useStudyStore((state) => state.topics);

  const shouldShow = isLoaded && isSignedIn && selectedRole === null;

  const handleSelectRole = (roleId: string) => {
    triggerHaptic("success");
    setSelectedRole(roleId);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-normal"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-border bg-secondary/30 flex flex-col gap-2 relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-4 h-4 text-foreground" /> Personalized Learning Path
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                What do you want to master?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-normal">
                Choose your target role to filter topics, customize your curriculum, and track progress focused exclusively on your career goal.
              </p>
            </div>

            {/* Roles Grid */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map((role) => {
                const roleTopicsCount = topics.filter((t) =>
                  role.categories.includes(t.category)
                ).length;

                return (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectRole(role.id)}
                    className="group p-5 rounded-2xl border border-border bg-background hover:bg-secondary/50 hover:border-foreground/40 cursor-pointer transition-colors duration-200 flex flex-col justify-between gap-4 relative shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-secondary border border-border group-hover:border-foreground/30 transition-colors">
                            {ROLE_ICONS[role.id] || <Target className="w-5 h-5 text-foreground" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-foreground">
                              {role.title}
                            </h3>
                            <span className="text-xs text-muted-foreground font-medium">
                              {roleTopicsCount} Relevant Topics
                            </span>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                          {role.badge}
                        </Badge>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                        {role.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-medium">
                      <div className="flex flex-wrap gap-1">
                        {role.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium uppercase"
                          >
                            {cat}
                          </span>
                        ))}
                        {role.categories.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium">
                            +{role.categories.length - 3}
                          </span>
                        )}
                      </div>

                      <span className="text-foreground group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs font-semibold">
                        Select Track <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground">
              <span>You can switch your target track anytime from the sidebar.</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectRole("all")}
                className="text-xs font-normal"
              >
                Skip & View All Topics
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

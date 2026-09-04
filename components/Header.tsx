"use client";

import React from "react";
import { TOPICS } from "@/data/topics";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, RotateCcw, CheckCircle2 } from "lucide-react";

export default function Header() {
  const activeTopic = useStudyStore((state) => state.getActiveTopic());
  const completedCount = useStudyStore((state) => state.completedTopics.length);
  const toggleSidebar = useStudyStore((state) => state.toggleSidebar);
  const resetProgress = useStudyStore((state) => state.resetProgress);

  const totalCount = TOPICS.length;

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all topic completion progress?")) {
      resetProgress();
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/90 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between font-normal">
      <div className="flex items-center gap-3 font-normal">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 text-xs font-normal">
          <Badge variant="secondary" className="font-medium uppercase text-[10px]">
            {activeTopic.category}
          </Badge>
          <span className="text-muted-foreground font-normal">/</span>
          <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
            {activeTopic.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 font-normal">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl border border-border bg-card text-xs text-muted-foreground font-normal">
          <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
          <span>
            Mastered <strong className="text-foreground font-semibold">{completedCount}</strong> of {totalCount}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-normal"
          title="Reset topic completion progress"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </header>
  );
}

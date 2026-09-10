"use client";

import React from "react";
import { TOPICS, CategoryType } from "@/data/topics";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Code2,
  Server,
  Globe,
  Zap,
  BookOpen,
  X,
  Trophy,
  Database,
  Shield,
  Layers,
  Cpu,
  Binary,
  Star,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";


const CATEGORY_ICONS: Record<CategoryType, React.ReactNode> = {
  JAVASCRIPT: <Code2 className="w-4 h-4 text-muted-foreground" />,
  REACT: <Zap className="w-4 h-4 text-muted-foreground" />,
  NODE: <Server className="w-4 h-4 text-muted-foreground" />,
  HTTP: <Globe className="w-4 h-4 text-muted-foreground" />,
  REDIS: <Layers className="w-4 h-4 text-muted-foreground" />,
  MYSQL: <Database className="w-4 h-4 text-muted-foreground" />,
  "SYSTEM DESIGN": <Cpu className="w-4 h-4 text-muted-foreground" />,
  SECURITY: <Shield className="w-4 h-4 text-muted-foreground" />,
  DSA: <Binary className="w-4 h-4 text-muted-foreground" />,
};

export default function Sidebar() {
  const {
    topics,
    activeTopicId,
    setActiveTopicId,
    completedTopics,
    toggleTopicComplete,
    isSidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    collapsedCategories,
    toggleCategoryCollapsed,
  } = useStudyStore();

  const categories = Array.from(new Set(topics.map((t) => t.category))) as CategoryType[];

  const toggleCategory = (category: string) => {
    toggleCategoryCollapsed(category);
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase());

    const isCompleted = completedTopics.includes(topic.id);

    if (filterState === "important" && !topic.isImportant) return false;
    if (filterState === "completed" && !isCompleted) return false;
    if (filterState === "uncompleted" && isCompleted) return false;

    return matchesSearch;
  });

  const totalCount = topics.length;
  const completedCount = completedTopics.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-84 sm:w-96 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col gap-3.5 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-semibold text-lg tracking-wide text-foreground flex items-center gap-1.5 uppercase">
                  DevDocs
                </h1>
                <p className="text-xs text-muted-foreground font-normal">Shadcn Study Guide</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Widget */}
          <div className="mt-1 p-3.5 rounded-2xl bg-secondary/50 border border-border flex flex-col gap-2.5 font-normal">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-foreground font-medium flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-foreground" /> Progress
              </span>
              <span className="font-medium text-foreground text-sm">
                {completedCount}/{totalCount} ({percentage}%)
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Search Box */}
          <div className="relative mt-1 font-normal">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-normal">
            <Button
              variant={filterState === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterState("all")}
              className="w-full text-xs font-medium"
            >
              All
            </Button>

            <Button
              variant={filterState === "important" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterState("important")}
              className="w-full text-xs font-medium flex items-center justify-center gap-1"
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Must Learn</span>
            </Button>

            <Button
              variant={filterState === "uncompleted" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterState("uncompleted")}
              className="w-full text-xs font-medium"
            >
              To Learn
            </Button>

            <Button
              variant={filterState === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterState("completed")}
              className="w-full text-xs font-medium"
            >
              Mastered
            </Button>
          </div>
        </div>

        {/* Topics List Navigation */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar font-normal">
          {categories.map((category) => {
            const categoryTopics = filteredTopics.filter((t) => t.category === category);
            if (categoryTopics.length === 0) return null;

            const activeCategory = topics.find((t) => t.id === activeTopicId)?.category;
            const isCollapsed =
              collapsedCategories[category] !== undefined
                ? collapsedCategories[category]
                : category !== activeCategory;

            const catCompleted = categoryTopics.filter((t) => completedTopics.includes(t.id)).length;

            return (
              <div key={category} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 font-semibold">
                    {CATEGORY_ICONS[category] || <Code2 className="w-4 h-4" />}
                    <span>{category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <span>
                      {catCompleted}/{categoryTopics.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Category Topics List */}
                {!isCollapsed && (
                  <div className="space-y-1 pl-1">
                    {categoryTopics.map((topic) => {
                      const isCompleted = completedTopics.includes(topic.id);
                      const isActive = topic.id === activeTopicId;

                      return (
                        <div
                          key={topic.id}
                          onClick={() => {
                            setActiveTopicId(topic.id);
                            setSidebarOpen(false);
                          }}
                          className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm sm:text-base cursor-pointer transition-all ${isActive
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground font-normal"
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTopicComplete(topic.id);
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            >
                              {isCompleted ? (
                                <CheckSquare className="w-4.5 h-4.5 text-foreground" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground" />
                              )}
                            </button>

                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className={`truncate ${isCompleted ? "line-through text-muted-foreground" : ""
                                  }`}
                              >
                                {topic.title}
                              </span>

                              {topic.isImportant && (
                                <span title="Must Learn Topic" className="flex items-center">
                                  <Star className="w-4 h-4 text-foreground fill-current flex-shrink-0" />
                                </span>
                              )}
                            </div>
                          </div>

                          <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                            {topic.difficulty[0]}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTopics.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground font-normal">
              No matching topics found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-card text-xs text-muted-foreground flex items-center justify-between font-normal">
          <span>Contribute on</span>
          <a href="https://github.com/jaychauhan-exe1/devdocs" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex gap-2 items-center">
            <FaGithub />
            <span>Github</span></a>
        </div>
      </aside>
    </>
  );
}

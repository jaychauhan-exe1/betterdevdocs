"use client";

import React, { useState, useEffect } from "react";
import { TOPICS } from "@/data/topics";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TopicViewer from "@/components/TopicViewer";

const STORAGE_KEY = "devdocs_completed_topics_v1";

export default function Home() {
  const [activeTopicId, setActiveTopicId] = useState<string>(TOPICS[0].id);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedTopics(new Set(parsed));
        }
      }
    } catch (e) {
      console.error("Failed to load completed topics from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleToggleComplete = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCompletedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error("Failed to persist topic completion to localStorage", err);
      }

      return next;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all topic completion progress?")) {
      setCompletedTopics(new Set());
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error("Failed to clear localStorage", err);
      }
    }
  };

  const activeTopic = TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Sidebar */}
      <Sidebar
        topics={TOPICS}
        activeTopicId={activeTopicId}
        onSelectTopic={(id) => setActiveTopicId(id)}
        completedTopics={completedTopics}
        onToggleComplete={handleToggleComplete}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar Header */}
        <Header
          activeTopic={activeTopic}
          completedCount={completedTopics.size}
          totalCount={TOPICS.length}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onResetProgress={handleResetProgress}
        />

        {/* Scrollable Topic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <TopicViewer
            topic={activeTopic}
            allTopics={TOPICS}
            isCompleted={completedTopics.has(activeTopic.id)}
            onToggleComplete={(id) => handleToggleComplete(id)}
            onSelectTopic={(id) => setActiveTopicId(id)}
          />
        </main>
      </div>
    </div>
  );
}

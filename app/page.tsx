"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TopicViewer from "@/components/TopicViewer";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white font-sans">
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-normal">
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
          <span>Loading study workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar Header */}
        <Header />

        {/* Scrollable Topic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <TopicViewer />
        </main>
      </div>
    </div>
  );
}

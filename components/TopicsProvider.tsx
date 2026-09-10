"use client";

import { useEffect } from "react";
import { useStudyStore } from "@/store/useStudyStore";

export function TopicsProvider({ children }: { children: React.ReactNode }) {
  const fetchTopics = useStudyStore((state) => state.fetchTopics);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return <>{children}</>;
}

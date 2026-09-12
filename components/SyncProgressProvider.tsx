"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStudyStore } from "@/store/useStudyStore";

import { RoleSelectionModal } from "@/components/RoleSelectionModal";

export function SyncProgressProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const setAuthenticated = useStudyStore((state) => state.setAuthenticated);
  const hydrateFromServer = useStudyStore((state) => state.hydrateFromServer);
  const resetUserProgress = useStudyStore((state) => state.resetUserProgress);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const controller = new AbortController();

    if (isSignedIn && userId) {
      // If user switched accounts or signed in for first time
      if (lastUserIdRef.current && lastUserIdRef.current !== userId) {
        resetUserProgress();
      }
      lastUserIdRef.current = userId;
      setAuthenticated(true);

      // Fetch user's individual cloud progress from API endpoint
      fetch("/api/progress", { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch progress");
          return res.json();
        })
        .then((data) => {
          hydrateFromServer(
            Array.isArray(data?.completedTopics) ? data.completedTopics : [],
            data?.activeTopicId,
            data?.selectedRole,
            data?.mcqAnswers,
            undefined,
            data?.topicNotes,
            data?.solvedChallenges
          );
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.warn("Failed to fetch cloud progress on login:", err);
        });
    } else {
      // User signed out: reset local store to avoid leaking progress across accounts
      if (lastUserIdRef.current !== null) {
        resetUserProgress();
        lastUserIdRef.current = null;
      }
      setAuthenticated(false);
    }

    return () => controller.abort();
  }, [isLoaded, isSignedIn, userId, setAuthenticated, hydrateFromServer, resetUserProgress]);

  return (
    <>
      <RoleSelectionModal />
      {children}
    </>
  );
}

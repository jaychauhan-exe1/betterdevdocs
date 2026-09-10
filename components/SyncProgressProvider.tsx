"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStudyStore } from "@/store/useStudyStore";

import { RoleSelectionModal } from "@/components/RoleSelectionModal";

export function SyncProgressProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const setAuthenticated = useStudyStore((state) => state.setAuthenticated);
  const hydrateFromServer = useStudyStore((state) => state.hydrateFromServer);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userId) {
      setAuthenticated(true);

      // Fetch progress & role from API endpoint
      fetch("/api/progress")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch progress");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data?.completedTopics)) {
            hydrateFromServer(data.completedTopics, data.activeTopicId, data.selectedRole);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch cloud progress on login:", err);
        });
    } else {
      setAuthenticated(false);
    }
  }, [isLoaded, isSignedIn, userId, setAuthenticated, hydrateFromServer]);

  return (
    <>
      <RoleSelectionModal />
      {children}
    </>
  );
}

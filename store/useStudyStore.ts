import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOPICS, Topic } from "@/data/topics";

export type FilterState = "all" | "important" | "uncompleted" | "completed";
export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface StudyState {
  topics: Topic[];
  activeTopicId: string;
  completedTopics: string[];
  isSidebarOpen: boolean;
  searchQuery: string;
  filterState: FilterState;
  collapsedCategories: Record<string, boolean>;

  // Cloud Sync State
  syncStatus: SyncStatus;
  isAuthenticated: boolean;

  // Actions
  setTopics: (topics: Topic[]) => void;
  fetchTopics: () => Promise<void>;
  setActiveTopicId: (id: string) => void;
  toggleTopicComplete: (id: string) => void;
  resetProgress: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filter: FilterState) => void;
  toggleCategoryCollapsed: (category: string) => void;
  setAuthenticated: (isAuth: boolean) => void;
  syncToServer: (completedTopicsOverride?: string[], activeTopicOverride?: string) => Promise<void>;
  hydrateFromServer: (completedTopics: string[], activeTopicId?: string | null) => void;

  // Helpers
  getActiveTopic: () => Topic;
  isTopicCompleted: (id: string) => boolean;
}

// Helper to push progress updates to API route
async function postProgressToServer(completedTopics: string[], activeTopicId?: string) {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedTopics, activeTopicId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      topics: TOPICS,
      activeTopicId: TOPICS[0]?.id || "js-variables",
      completedTopics: [],
      isSidebarOpen: false,
      searchQuery: "",
      filterState: "all",
      collapsedCategories: {},
      syncStatus: "idle",
      isAuthenticated: false,

      setTopics: (newTopics: Topic[]) => {
        if (!Array.isArray(newTopics) || newTopics.length === 0) return;
        set({ topics: newTopics });
      },

      fetchTopics: async () => {
        try {
          const res = await fetch("/api/topics");
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data?.topics) && data.topics.length > 0) {
            set({ topics: data.topics });
          }
        } catch (err) {
          console.warn("Failed to fetch topics dynamically, using store fallback", err);
        }
      },

      setAuthenticated: (isAuth: boolean) => set({ isAuthenticated: isAuth }),

      setActiveTopicId: (id: string) => {
        set((state) => {
          const currentTopics = state.topics;
          const targetTopic = currentTopics.find((t) => t.id === id);
          if (!targetTopic) return { activeTopicId: id };

          const newCollapsed: Record<string, boolean> = {};
          const categories = Array.from(new Set(currentTopics.map((t) => t.category)));
          categories.forEach((cat) => {
            newCollapsed[cat] = cat !== targetTopic.category;
          });

          return {
            activeTopicId: id,
            collapsedCategories: newCollapsed,
          };
        });

        // Trigger background sync if authenticated
        const { isAuthenticated, completedTopics, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, id);
        }
      },

      toggleTopicComplete: (id: string) => {
        let updatedCompleted: string[] = [];
        set((state) => {
          const exists = state.completedTopics.includes(id);
          updatedCompleted = exists
            ? state.completedTopics.filter((t) => t !== id)
            : [...state.completedTopics, id];
          return { completedTopics: updatedCompleted };
        });

        // Trigger background sync if authenticated
        const { isAuthenticated, activeTopicId, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(updatedCompleted, activeTopicId);
        }
      },

      resetProgress: () => {
        set({ completedTopics: [] });
        const { isAuthenticated, activeTopicId, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer([], activeTopicId);
        }
      },

      syncToServer: async (completedTopicsOverride?: string[], activeTopicOverride?: string) => {
        const completed = completedTopicsOverride ?? get().completedTopics;
        const active = activeTopicOverride ?? get().activeTopicId;

        set({ syncStatus: "syncing" });
        const ok = await postProgressToServer(completed, active);
        set({ syncStatus: ok ? "synced" : "error" });
      },

      hydrateFromServer: (serverCompleted: string[], serverActiveTopic?: string | null) => {
        set((state) => {
          // Merge server completed topics with local completed topics (union)
          const mergedSet = new Set([...state.completedTopics, ...serverCompleted]);
          const mergedCompleted = Array.from(mergedSet);
          const nextActiveTopic = serverActiveTopic || state.activeTopicId;

          return {
            completedTopics: mergedCompleted,
            activeTopicId: nextActiveTopic,
            syncStatus: "synced",
          };
        });

        // Push merged state back to server to keep database perfectly in sync
        const { completedTopics, activeTopicId } = get();
        postProgressToServer(completedTopics, activeTopicId);
      },

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      setFilterState: (filter: FilterState) => set({ filterState: filter }),

      toggleCategoryCollapsed: (category: string) =>
        set((state) => {
          const currentTopics = state.topics;
          const activeCategory = currentTopics.find((t) => t.id === state.activeTopicId)?.category;
          const currentIsCollapsed =
            state.collapsedCategories[category] !== undefined
              ? state.collapsedCategories[category]
              : category !== activeCategory;

          return {
            collapsedCategories: {
              ...state.collapsedCategories,
              [category]: !currentIsCollapsed,
            },
          };
        }),

      getActiveTopic: () => {
        const { activeTopicId, topics } = get();
        return topics.find((t) => t.id === activeTopicId) || topics[0] || TOPICS[0];
      },

      isTopicCompleted: (id: string) => {
        return get().completedTopics.includes(id);
      },
    }),
    {
      name: "devdocs_study_store_v1",
      partialize: (state) => ({
        completedTopics: state.completedTopics,
        activeTopicId: state.activeTopicId,
        collapsedCategories: state.collapsedCategories,
      }),
    }
  )
);

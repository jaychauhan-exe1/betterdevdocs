import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOPICS, Topic } from "@/data/topics";
import { ROLES } from "@/data/roles";

export type FilterState = "all" | "uncompleted" | "completed";
export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface StudyState {
  topics: Topic[];
  activeTopicId: string;
  completedTopics: string[];
  selectedRole: string | null;
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
  setSelectedRole: (roleId: string) => void;
  setActiveTopicId: (id: string) => void;
  toggleTopicComplete: (id: string) => void;
  resetProgress: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filter: FilterState) => void;
  toggleCategoryCollapsed: (category: string) => void;
  setAuthenticated: (isAuth: boolean) => void;
  syncToServer: (completedTopicsOverride?: string[], activeTopicOverride?: string, roleOverride?: string | null) => Promise<void>;
  hydrateFromServer: (completedTopics: string[], activeTopicId?: string | null, selectedRole?: string | null) => void;

  // Helpers
  getActiveTopic: () => Topic;
  getRoleFilteredTopics: () => Topic[];
  isTopicCompleted: (id: string) => boolean;
}

// Helper to push progress updates to API route
async function postProgressToServer(completedTopics: string[], activeTopicId?: string, selectedRole?: string | null) {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedTopics, activeTopicId, selectedRole }),
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
      selectedRole: null,
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

      setSelectedRole: (roleId: string) => {
        set({ selectedRole: roleId });
        const { getRoleFilteredTopics, activeTopicId, setActiveTopicId, isAuthenticated, completedTopics, syncToServer } = get();
        const roleTopics = getRoleFilteredTopics();
        const isCurrentInRole = roleTopics.some((t) => t.id === activeTopicId);

        if (!isCurrentInRole && roleTopics.length > 0) {
          setActiveTopicId(roleTopics[0].id);
        } else if (isAuthenticated) {
          syncToServer(completedTopics, activeTopicId, roleId);
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
        const { isAuthenticated, completedTopics, selectedRole, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, id, selectedRole);
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
        const { isAuthenticated, activeTopicId, selectedRole, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(updatedCompleted, activeTopicId, selectedRole);
        }
      },

      resetProgress: () => {
        set({ completedTopics: [] });
        const { isAuthenticated, activeTopicId, selectedRole, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer([], activeTopicId, selectedRole);
        }
      },

      syncToServer: async (completedTopicsOverride?: string[], activeTopicOverride?: string, roleOverride?: string | null) => {
        const completed = completedTopicsOverride ?? get().completedTopics;
        const active = activeTopicOverride ?? get().activeTopicId;
        const role = roleOverride !== undefined ? roleOverride : get().selectedRole;

        set({ syncStatus: "syncing" });
        const ok = await postProgressToServer(completed, active, role);
        set({ syncStatus: ok ? "synced" : "error" });
      },

      hydrateFromServer: (serverCompleted: string[], serverActiveTopic?: string | null, serverRole?: string | null) => {
        set((state) => {
          // Merge server completed topics with local completed topics (union)
          const mergedSet = new Set([...state.completedTopics, ...serverCompleted]);
          const mergedCompleted = Array.from(mergedSet);
          const nextActiveTopic = serverActiveTopic || state.activeTopicId;
          const nextRole = serverRole || state.selectedRole;

          return {
            completedTopics: mergedCompleted,
            activeTopicId: nextActiveTopic,
            selectedRole: nextRole,
            syncStatus: "synced",
          };
        });

        // Push merged state back to server to keep database perfectly in sync
        const { completedTopics, activeTopicId, selectedRole } = get();
        postProgressToServer(completedTopics, activeTopicId, selectedRole);
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

      getRoleFilteredTopics: () => {
        const { topics, selectedRole } = get();
        if (!selectedRole || selectedRole === "all") return topics;
        const roleDef = ROLES.find((r) => r.id === selectedRole);
        if (!roleDef) return topics;
        return topics.filter((t) => roleDef.categories.includes(t.category));
      },

      getActiveTopic: () => {
        const { activeTopicId, topics } = get();
        const roleTopics = get().getRoleFilteredTopics();
        const foundInRole = roleTopics.find((t) => t.id === activeTopicId);
        if (foundInRole) return foundInRole;
        return roleTopics[0] || topics.find((t) => t.id === activeTopicId) || topics[0] || TOPICS[0];
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
        selectedRole: state.selectedRole,
        collapsedCategories: state.collapsedCategories,
      }),
    }
  )
);

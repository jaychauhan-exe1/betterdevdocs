import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOPICS, Topic } from "@/data/topics";
import { ROLES } from "@/data/roles";

import { calculateUserPoints, PointsSummary } from "@/lib/points";

export type FilterState = "all" | "uncompleted" | "completed";
export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface StudyState {
  topics: Topic[];
  activeTopicId: string;
  completedTopics: string[];
  mcqAnswers: Record<string, Record<number, number>>;
  submittedQuizzes: Record<string, boolean>;
  topicNotes: Record<string, string>;
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
  setTopicMcqAnswers: (topicId: string, answers: Record<number, number>) => void;
  setQuizSubmitted: (topicId: string, isSubmitted: boolean) => void;
  setTopicNote: (topicId: string, note: string) => void;
  resetProgress: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filter: FilterState) => void;
  toggleCategoryCollapsed: (category: string) => void;
  setAuthenticated: (isAuth: boolean) => void;
  syncToServer: (
    completedTopicsOverride?: string[],
    activeTopicOverride?: string,
    roleOverride?: string | null,
    mcqAnswersOverride?: Record<string, Record<number, number>>,
    topicNotesOverride?: Record<string, string>
  ) => Promise<void>;
  hydrateFromServer: (
    completedTopics: string[],
    activeTopicId?: string | null,
    selectedRole?: string | null,
    mcqAnswers?: Record<string, Record<number, number>>,
    submittedQuizzes?: Record<string, boolean>,
    topicNotes?: Record<string, string>
  ) => void;

  // Helpers
  getActiveTopic: () => Topic;
  getRoleFilteredTopics: () => Topic[];
  isTopicCompleted: (id: string) => boolean;
  getPointsSummary: () => PointsSummary;
}

// Helper to push progress updates to API route
async function postProgressToServer(
  completedTopics: string[],
  activeTopicId?: string,
  selectedRole?: string | null,
  mcqAnswers?: Record<string, Record<number, number>>,
  topicNotes?: Record<string, string>
) {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes }),
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
      mcqAnswers: {},
      submittedQuizzes: {},
      topicNotes: {},
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
        const { getRoleFilteredTopics, activeTopicId, setActiveTopicId, isAuthenticated, completedTopics, mcqAnswers, syncToServer } = get();
        const roleTopics = getRoleFilteredTopics();
        const isCurrentInRole = roleTopics.some((t) => t.id === activeTopicId);

        if (!isCurrentInRole && roleTopics.length > 0) {
          setActiveTopicId(roleTopics[0].id);
        } else if (isAuthenticated) {
          syncToServer(completedTopics, activeTopicId, roleId, mcqAnswers);
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
        const { isAuthenticated, completedTopics, selectedRole, mcqAnswers, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, id, selectedRole, mcqAnswers);
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
        const { isAuthenticated, activeTopicId, selectedRole, mcqAnswers, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(updatedCompleted, activeTopicId, selectedRole, mcqAnswers);
        }
      },

      setTopicMcqAnswers: (topicId: string, answers: Record<number, number>) => {
        let updatedMcqAnswers: Record<string, Record<number, number>> = {};
        set((state) => {
          updatedMcqAnswers = {
            ...state.mcqAnswers,
            [topicId]: answers,
          };
          return { mcqAnswers: updatedMcqAnswers };
        });

        const { isAuthenticated, completedTopics, activeTopicId, selectedRole, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, activeTopicId, selectedRole, updatedMcqAnswers);
        }
      },

      setQuizSubmitted: (topicId: string, isSubmitted: boolean) => {
        set((state) => {
          const updatedSubmissions = {
            ...state.submittedQuizzes,
            [topicId]: isSubmitted,
          };
          // If retaking, clear answers for this topic
          const updatedAnswers = isSubmitted
            ? state.mcqAnswers
            : { ...state.mcqAnswers, [topicId]: {} };

          return {
            submittedQuizzes: updatedSubmissions,
            mcqAnswers: updatedAnswers,
          };
        });

        const { isAuthenticated, completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes);
        }
      },

      setTopicNote: (topicId: string, note: string) => {
        let updatedNotes: Record<string, string> = {};
        set((state) => {
          updatedNotes = {
            ...state.topicNotes,
            [topicId]: note,
          };
          return { topicNotes: updatedNotes };
        });

        const { isAuthenticated, completedTopics, activeTopicId, selectedRole, mcqAnswers, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, activeTopicId, selectedRole, mcqAnswers, updatedNotes);
        }
      },

      resetProgress: () => {
        set({ completedTopics: [], mcqAnswers: {}, submittedQuizzes: {}, topicNotes: {} });
        const { isAuthenticated, activeTopicId, selectedRole, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer([], activeTopicId, selectedRole, {}, {});
        }
      },

      syncToServer: async (
        completedTopicsOverride?: string[],
        activeTopicOverride?: string,
        roleOverride?: string | null,
        mcqAnswersOverride?: Record<string, Record<number, number>>,
        topicNotesOverride?: Record<string, string>
      ) => {
        const completed = completedTopicsOverride ?? get().completedTopics;
        const active = activeTopicOverride ?? get().activeTopicId;
        const role = roleOverride !== undefined ? roleOverride : get().selectedRole;
        const answers = mcqAnswersOverride ?? get().mcqAnswers;
        const notes = topicNotesOverride ?? get().topicNotes;

        set({ syncStatus: "syncing" });
        const ok = await postProgressToServer(completed, active, role, answers, notes);
        set({ syncStatus: ok ? "synced" : "error" });
      },

      hydrateFromServer: (
        serverCompleted: string[],
        serverActiveTopic?: string | null,
        serverRole?: string | null,
        serverMcqAnswers?: Record<string, Record<number, number>>,
        serverSubmittedQuizzes?: Record<string, boolean>,
        serverTopicNotes?: Record<string, string>
      ) => {
        set((state) => {
          const mergedSet = new Set([...state.completedTopics, ...serverCompleted]);
          const mergedCompleted = Array.from(mergedSet);
          const nextActiveTopic = serverActiveTopic || state.activeTopicId;
          const nextRole = serverRole || state.selectedRole;
          const nextMcqAnswers = {
            ...state.mcqAnswers,
            ...(serverMcqAnswers || {}),
          };
          const nextTopicNotes = {
            ...state.topicNotes,
            ...(serverTopicNotes || {}),
          };

          return {
            completedTopics: mergedCompleted,
            activeTopicId: nextActiveTopic,
            selectedRole: nextRole,
            mcqAnswers: nextMcqAnswers,
            topicNotes: nextTopicNotes,
            syncStatus: "synced",
          };
        });

        const { completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes } = get();
        postProgressToServer(completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes);
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

      getPointsSummary: () => {
        const { topics, completedTopics, mcqAnswers } = get();
        return calculateUserPoints(topics, completedTopics, mcqAnswers);
      },
    }),
    {
      name: "devdocs_study_store_v1",
      partialize: (state) => ({
        completedTopics: state.completedTopics,
        activeTopicId: state.activeTopicId,
        selectedRole: state.selectedRole,
        mcqAnswers: state.mcqAnswers,
        submittedQuizzes: state.submittedQuizzes,
        topicNotes: state.topicNotes,
        collapsedCategories: state.collapsedCategories,
      }),
    }
  )
);

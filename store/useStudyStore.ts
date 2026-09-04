import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOPICS, Topic } from "@/data/topics";

export type FilterState = "all" | "important" | "uncompleted" | "completed";

interface StudyState {
  activeTopicId: string;
  completedTopics: string[];
  isSidebarOpen: boolean;
  searchQuery: string;
  filterState: FilterState;
  collapsedCategories: Record<string, boolean>;

  // Actions
  setActiveTopicId: (id: string) => void;
  toggleTopicComplete: (id: string) => void;
  resetProgress: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filter: FilterState) => void;
  toggleCategoryCollapsed: (category: string) => void;

  // Helpers
  getActiveTopic: () => Topic;
  isTopicCompleted: (id: string) => boolean;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      activeTopicId: TOPICS[0]?.id || "js-variables",
      completedTopics: [],
      isSidebarOpen: false,
      searchQuery: "",
      filterState: "all",
      collapsedCategories: {},

      setActiveTopicId: (id: string) =>
        set(() => {
          const targetTopic = TOPICS.find((t) => t.id === id);
          if (!targetTopic) return { activeTopicId: id };

          const newCollapsed: Record<string, boolean> = {};
          const categories = Array.from(new Set(TOPICS.map((t) => t.category)));
          categories.forEach((cat) => {
            newCollapsed[cat] = cat !== targetTopic.category;
          });

          return {
            activeTopicId: id,
            collapsedCategories: newCollapsed,
          };
        }),

      toggleTopicComplete: (id: string) =>
        set((state) => {
          const exists = state.completedTopics.includes(id);
          const nextCompleted = exists
            ? state.completedTopics.filter((t) => t !== id)
            : [...state.completedTopics, id];
          return { completedTopics: nextCompleted };
        }),

      resetProgress: () => set({ completedTopics: [] }),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      setFilterState: (filter: FilterState) => set({ filterState: filter }),

      toggleCategoryCollapsed: (category: string) =>
        set((state) => {
          const activeCategory = TOPICS.find((t) => t.id === state.activeTopicId)?.category;
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
        const { activeTopicId } = get();
        return TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];
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

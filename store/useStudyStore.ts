import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOPICS, Topic } from "@/data/topics";
import { ROLES } from "@/data/roles";
import { CODING_CHALLENGES } from "@/data/coding-challenges";

import { calculateUserPoints, calculateCodingPoints, PointsSummary } from "@/lib/points";

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
  isImportantOnly: boolean;
  collapsedCategories: Record<string, boolean>;

  // Coding Challenge State
  solvedChallenges: Record<string, { solvedAt: number; code: string }>;
  challengeAttempts: Record<string, string>;
  failedSubmissions: Record<string, number>;

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
  markChallengeSolved: (challengeId: string, code: string) => void;
  saveChallengeAttempt: (challengeId: string, code: string) => void;
  recordFailedSubmit: (challengeId: string) => void;
  resetProgress: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterState: (filter: FilterState) => void;
  setIsImportantOnly: (importantOnly: boolean) => void;
  toggleImportantOnly: () => void;
  toggleCategoryCollapsed: (category: string) => void;
  setCollapsedCategories: (collapsed: Record<string, boolean>) => void;
  setAuthenticated: (isAuth: boolean) => void;
  resetUserProgress: () => void;
  syncToServer: (
    completedTopicsOverride?: string[],
    activeTopicOverride?: string,
    roleOverride?: string | null,
    mcqAnswersOverride?: Record<string, Record<number, number>>,
    topicNotesOverride?: Record<string, string>,
    solvedChallengesOverride?: Record<string, { solvedAt: number; code: string }>
  ) => Promise<void>;
  hydrateFromServer: (
    completedTopics: string[],
    activeTopicId?: string | null,
    selectedRole?: string | null,
    mcqAnswers?: Record<string, Record<number, number>>,
    submittedQuizzes?: Record<string, boolean>,
    topicNotes?: Record<string, string>,
    solvedChallenges?: Record<string, { solvedAt: number; code: string }>
  ) => void;

  // Helpers
  getActiveTopic: () => Topic;
  getRoleFilteredTopics: () => Topic[];
  isTopicCompleted: (id: string) => boolean;
  isChallengeSolved: (challengeId: string) => boolean;
  getPointsSummary: () => PointsSummary;
}

// Helper to push progress updates to API route
async function postProgressToServer(
  completedTopics: string[],
  activeTopicId?: string,
  selectedRole?: string | null,
  mcqAnswers?: Record<string, Record<number, number>>,
  topicNotes?: Record<string, string>,
  solvedChallenges?: Record<string, { solvedAt: number; code: string }>
) {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes, solvedChallenges }),
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
      solvedChallenges: {},
      challengeAttempts: {},
      failedSubmissions: {},
      selectedRole: null,
      isSidebarOpen: false,
      searchQuery: "",
      filterState: "all",
      isImportantOnly: false,
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
          if (Array.isArray(data?.topics) && data.topics.length >= TOPICS.length) {
            set({ topics: data.topics });
          } else {
            set({ topics: TOPICS });
          }
        } catch (err) {
          console.warn("Failed to fetch topics dynamically, using store fallback", err);
          set({ topics: TOPICS });
        }
      },

      setSelectedRole: (roleId: string) => {
        set({ selectedRole: roleId });
        const { getRoleFilteredTopics, activeTopicId, setActiveTopicId, isAuthenticated, completedTopics, mcqAnswers, syncToServer } = get();
        const roleTopics = getRoleFilteredTopics();
        const isCurrentInRole = roleTopics.some((t) => t.id === activeTopicId);

        if (!isCurrentInRole && roleTopics.length > 0) {
          const firstUndone = roleTopics.find((t) => !completedTopics.includes(t.id));
          setActiveTopicId(firstUndone ? firstUndone.id : roleTopics[0].id);
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

          const newCollapsed: Record<string, boolean> = { ...state.collapsedCategories };
          const categories = Array.from(new Set(currentTopics.map((t) => t.category)));

          categories.forEach((cat) => {
            const catTopics = currentTopics.filter((t) => t.category === cat);
            const isCatCompleted = catTopics.length > 0 && catTopics.every((t) => state.completedTopics.includes(t.id));

            if (isCatCompleted) {
              if (cat !== targetTopic.category) {
                newCollapsed[cat] = true;
              }
            } else {
              if (cat === targetTopic.category) {
                newCollapsed[cat] = false;
              }
            }
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
        let newActiveTopicId: string | null = null;
        let newCollapsed: Record<string, boolean> = {};

        set((state) => {
          const wasCompleted = state.completedTopics.includes(id);
          updatedCompleted = wasCompleted
            ? state.completedTopics.filter((t) => t !== id)
            : [...state.completedTopics, id];

          newCollapsed = { ...state.collapsedCategories };
          newActiveTopicId = state.activeTopicId;

          // Only trigger auto-advance/collapse if topic was JUST marked completed
          if (!wasCompleted) {
            const roleTopics = get().getRoleFilteredTopics();
            const currentTopic = roleTopics.find((t) => t.id === id);

            if (currentTopic) {
              const currentCategory = currentTopic.category;
              const catTopics = roleTopics.filter((t) => t.category === currentCategory);
              const isCatFullyCompleted = catTopics.every((t) => updatedCompleted.includes(t.id));

              if (isCatFullyCompleted) {
                // 1. Close/collapse current category dropdown
                newCollapsed[currentCategory] = true;

                // 2. Find next category with undone topics
                const categories = Array.from(new Set(roleTopics.map((t) => t.category)));
                const currentCatIdx = categories.indexOf(currentCategory);
                let nextUndoneCat: string | null = null;

                for (let i = 1; i <= categories.length; i++) {
                  const checkCat = categories[(currentCatIdx + i) % categories.length];
                  const checkCatTopics = roleTopics.filter((t) => t.category === checkCat);
                  const hasUndone = checkCatTopics.some((t) => !updatedCompleted.includes(t.id));
                  if (hasUndone) {
                    nextUndoneCat = checkCat;
                    break;
                  }
                }

                if (nextUndoneCat) {
                  // 3. Open/expand next category dropdown
                  newCollapsed[nextUndoneCat] = false;

                  // 4. Set active topic to 1st undone topic in that next category
                  const nextCatTopics = roleTopics.filter((t) => t.category === nextUndoneCat);
                  const firstUndone = nextCatTopics.find((t) => !updatedCompleted.includes(t.id));
                  if (firstUndone) {
                    newActiveTopicId = firstUndone.id;
                  }
                }
              } else {
                // Advance to next undone topic in current category if active topic was completed
                if (state.activeTopicId === id) {
                  const nextUndoneInCat = catTopics.find((t) => !updatedCompleted.includes(t.id));
                  if (nextUndoneInCat) {
                    newActiveTopicId = nextUndoneInCat.id;
                  }
                }
              }
            }
          }

          return {
            completedTopics: updatedCompleted,
            activeTopicId: newActiveTopicId || state.activeTopicId,
            collapsedCategories: newCollapsed,
          };
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

      markChallengeSolved: (challengeId: string, code: string) => {
        let updatedSolved: Record<string, { solvedAt: number; code: string }> = {};
        set((state) => {
          updatedSolved = {
            ...state.solvedChallenges,
            [challengeId]: { solvedAt: Date.now(), code },
          };
          return { solvedChallenges: updatedSolved };
        });

        const { isAuthenticated, completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer(completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes, updatedSolved);
        }
      },

      saveChallengeAttempt: (challengeId: string, code: string) => {
        set((state) => ({
          challengeAttempts: {
            ...state.challengeAttempts,
            [challengeId]: code,
          },
        }));
      },

      recordFailedSubmit: (challengeId: string) => {
        set((state) => {
          const currentCount = state.failedSubmissions?.[challengeId] || 0;
          return {
            failedSubmissions: {
              ...(state.failedSubmissions || {}),
              [challengeId]: currentCount + 1,
            },
          };
        });
      },

      resetProgress: () => {
        set({ completedTopics: [], mcqAnswers: {}, submittedQuizzes: {}, topicNotes: {}, solvedChallenges: {}, challengeAttempts: {}, failedSubmissions: {} });
        const { isAuthenticated, activeTopicId, selectedRole, syncToServer } = get();
        if (isAuthenticated) {
          syncToServer([], activeTopicId, selectedRole, {}, {}, {});
        }
      },

      syncToServer: async (
        completedTopicsOverride?: string[],
        activeTopicOverride?: string,
        roleOverride?: string | null,
        mcqAnswersOverride?: Record<string, Record<number, number>>,
        topicNotesOverride?: Record<string, string>,
        solvedChallengesOverride?: Record<string, { solvedAt: number; code: string }>
      ) => {
        const completed = completedTopicsOverride ?? get().completedTopics;
        const active = activeTopicOverride ?? get().activeTopicId;
        const role = roleOverride !== undefined ? roleOverride : get().selectedRole;
        const answers = mcqAnswersOverride ?? get().mcqAnswers;
        const notes = topicNotesOverride ?? get().topicNotes;
        const solved = solvedChallengesOverride ?? get().solvedChallenges;

        set({ syncStatus: "syncing" });
        const ok = await postProgressToServer(completed, active, role, answers, notes, solved);
        set({ syncStatus: ok ? "synced" : "error" });
      },

      resetUserProgress: () => {
        set({
          completedTopics: [],
          activeTopicId: TOPICS[0]?.id || "js-variables",
          mcqAnswers: {},
          submittedQuizzes: {},
          topicNotes: {},
          solvedChallenges: {},
          challengeAttempts: {},
          failedSubmissions: {},
          syncStatus: "idle",
        });
      },

      hydrateFromServer: (
        serverCompleted: string[],
        serverActiveTopic?: string | null,
        serverRole?: string | null,
        serverMcqAnswers?: Record<string, Record<number, number>>,
        serverSubmittedQuizzes?: Record<string, boolean>,
        serverTopicNotes?: Record<string, string>,
        serverSolvedChallenges?: Record<string, { solvedAt: number; code: string }>
      ) => {
        set({
          completedTopics: Array.isArray(serverCompleted) ? serverCompleted : [],
          activeTopicId: serverActiveTopic || TOPICS[0]?.id || "js-variables",
          selectedRole: serverRole !== undefined ? serverRole : null,
          mcqAnswers: serverMcqAnswers || {},
          submittedQuizzes: serverSubmittedQuizzes || {},
          topicNotes: serverTopicNotes || {},
          solvedChallenges: serverSolvedChallenges || {},
          syncStatus: "synced",
        });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (isOpen: boolean) => {
        set({ isSidebarOpen: isOpen });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setFilterState: (filter: FilterState) => {
        set({ filterState: filter });
      },

      setIsImportantOnly: (importantOnly: boolean) => {
        set({ isImportantOnly: importantOnly });
        const { getRoleFilteredTopics, activeTopicId, setActiveTopicId, completedTopics } = get();
        const roleTopics = getRoleFilteredTopics();
        const isCurrentInFiltered = roleTopics.some((t) => t.id === activeTopicId);

        if (!isCurrentInFiltered && roleTopics.length > 0) {
          const firstUndone = roleTopics.find((t) => !completedTopics.includes(t.id));
          setActiveTopicId(firstUndone ? firstUndone.id : roleTopics[0].id);
        }
      },

      toggleImportantOnly: () => {
        const nextState = !get().isImportantOnly;
        get().setIsImportantOnly(nextState);
      },

      toggleCategoryCollapsed: (category: string) => {
        set((state) => {
          const currentIsCollapsed =
            state.collapsedCategories[category] !== undefined
              ? state.collapsedCategories[category]
              : false;

          return {
            collapsedCategories: {
              ...state.collapsedCategories,
              [category]: !currentIsCollapsed,
            },
          };
        });
      },

      setCollapsedCategories: (collapsed: Record<string, boolean>) => {
        set({ collapsedCategories: collapsed });
      },

      getRoleFilteredTopics: () => {
        const { topics, selectedRole, isImportantOnly } = get();
        let filtered = topics;
        if (selectedRole && selectedRole !== "all") {
          const roleDef = ROLES.find((r) => r.id === selectedRole);
          filtered = topics.filter((t) => {
            if (t.roles && Array.isArray(t.roles) && t.roles.length > 0) {
              return t.roles.includes(selectedRole);
            }
            return roleDef ? roleDef.categories.includes(t.category) : true;
          });
        }
        if (isImportantOnly) {
          filtered = filtered.filter((t) => t.isImportant);
        }
        return filtered;
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

      isChallengeSolved: (challengeId: string) => {
        return Boolean(get().solvedChallenges[challengeId]);
      },

      getPointsSummary: () => {
        const { topics, completedTopics, mcqAnswers, solvedChallenges, failedSubmissions } = get();
        const summary = calculateUserPoints(topics, completedTopics, mcqAnswers);
        const totalFailedSubmissions = Object.values(failedSubmissions || {}).reduce((a, b) => a + b, 0);
        const coding = calculateCodingPoints(solvedChallenges, CODING_CHALLENGES, totalFailedSubmissions);
        const totalWithCoding = Math.round((summary.totalPoints + coding.totalCodingPoints) * 10) / 10;

        return {
          ...summary,
          totalPoints: totalWithCoding,
          codingPoints: coding,
        };
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
        solvedChallenges: state.solvedChallenges,
        challengeAttempts: state.challengeAttempts,
        failedSubmissions: state.failedSubmissions,
        collapsedCategories: state.collapsedCategories,
        isImportantOnly: state.isImportantOnly,
      }),
    }
  )
);

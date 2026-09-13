export interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl: string;
  topicPoints: number;
  mcqPoints: number;
  totalPoints: number;
  rank?: number;
  isCurrentUser?: boolean;
}

export function getLocalUserLeaderboardEntry(
  currentUserPoints: { topicPoints: number; mcqPoints: number; totalPoints: number },
  clerkUser?: any
): LeaderboardUser {
  const isAnonymous = !clerkUser;
  const rawUsername =
    clerkUser?.username ||
    clerkUser?.firstName?.toLowerCase() ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "anonymous";

  const formattedUsername = isAnonymous ? "@anonymous" : (rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`);
  const avatarUrl =
    clerkUser?.imageUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

  return {
    id: clerkUser?.id || "anonymous_user",
    username: formattedUsername,
    avatarUrl,
    topicPoints: currentUserPoints.topicPoints,
    mcqPoints: currentUserPoints.mcqPoints,
    totalPoints: currentUserPoints.totalPoints,
    rank: undefined,
    isCurrentUser: true,
  };
}

export function computeRankedLeaderboard(
  serverUsers: LeaderboardUser[],
  localUserEntry: LeaderboardUser,
  isLoggedIn: boolean
): { leaderboard: LeaderboardUser[]; currentUserRank: number; totalParticipants: number } {
  let combined: LeaderboardUser[] = [];

  if (isLoggedIn) {
    const index = serverUsers.findIndex((u) => u.id === localUserEntry.id || u.isCurrentUser);
    if (index !== -1) {
      combined = serverUsers.map((u, i) => {
        if (i === index) {
          return {
            ...u,
            topicPoints: Math.max(u.topicPoints, localUserEntry.topicPoints),
            mcqPoints: Math.max(u.mcqPoints, localUserEntry.mcqPoints),
            totalPoints: Math.max(u.totalPoints, localUserEntry.totalPoints),
            isCurrentUser: true,
          };
        }
        return { ...u, isCurrentUser: false };
      });
    } else {
      combined = [...serverUsers.map((u) => ({ ...u, isCurrentUser: false })), localUserEntry];
    }
  } else {
    const filtered = serverUsers
      .filter((u) => u.id !== "anonymous_user")
      .map((u) => ({ ...u, isCurrentUser: false }));
    combined = [...filtered, localUserEntry];
  }

  combined.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.topicPoints !== a.topicPoints) return b.topicPoints - a.topicPoints;
    return b.mcqPoints - a.mcqPoints;
  });

  let currentUserRank = 1;
  const ranked = combined.map((user, idx) => {
    const rank = idx + 1;
    if (user.isCurrentUser) {
      currentUserRank = rank;
    }
    return {
      ...user,
      rank,
    };
  });

  return {
    leaderboard: ranked,
    currentUserRank,
    totalParticipants: ranked.length,
  };
}

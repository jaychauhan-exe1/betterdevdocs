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
  const rawUsername =
    clerkUser?.username ||
    clerkUser?.firstName?.toLowerCase() ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "you";

  const formattedUsername = rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`;
  const avatarUrl =
    clerkUser?.imageUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

  return {
    id: clerkUser?.id || "current_user",
    username: formattedUsername,
    avatarUrl,
    topicPoints: currentUserPoints.topicPoints,
    mcqPoints: currentUserPoints.mcqPoints,
    totalPoints: currentUserPoints.totalPoints,
    rank: 1,
    isCurrentUser: true,
  };
}

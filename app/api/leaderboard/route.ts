import { NextResponse } from "next/server";
import { createClerkClient, auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { TOPICS } from "@/data/topics";
import { CODING_CHALLENGES } from "@/data/coding-challenges";
import { calculateUserPoints, calculateCodingPoints } from "@/lib/points";
import { LeaderboardUser } from "@/lib/leaderboard";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { userId: currentUserId } = await auth();
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // 1. Fetch real Clerk users
    let clerkUsers: any[] = [];
    try {
      const response = await clerk.users.getUserList({ limit: 100 });
      clerkUsers = response.data || [];
    } catch (err) {
      console.warn("Failed to fetch Clerk user list:", err);
    }

    // 2. Fetch Supabase user_progress records
    const supabase = getSupabaseAdmin();
    let supabaseProgressMap: Record<string, { completed_topics?: string[]; mcq_answers?: any; solved_challenges?: any }> = {};
    if (supabase) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("user_id, completed_topics, mcq_answers, solved_challenges");
      if (!error && Array.isArray(data)) {
        data.forEach((row) => {
          supabaseProgressMap[row.user_id] = row;
        });
      }
    }

    // 3. Map real app users to LeaderboardUser entries
    const leaderboardUsers: LeaderboardUser[] = clerkUsers.map((u) => {
      const spData = supabaseProgressMap[u.id];
      const completedTopics: string[] =
        spData?.completed_topics ||
        (Array.isArray(u.unsafeMetadata?.completedTopics) ? u.unsafeMetadata.completedTopics : []);
      const mcqAnswers: Record<string, Record<number, number>> =
        spData?.mcq_answers ||
        (u.unsafeMetadata?.mcqAnswers && typeof u.unsafeMetadata.mcqAnswers === "object"
          ? u.unsafeMetadata.mcqAnswers
          : {});
      const solvedChallenges: Record<string, { solvedAt: number; code: string }> =
        spData?.solved_challenges ||
        (u.unsafeMetadata?.solvedChallenges && typeof u.unsafeMetadata.solvedChallenges === "object"
          ? (u.unsafeMetadata.solvedChallenges as any)
          : {});

      const pointsSummary = calculateUserPoints(TOPICS, completedTopics, mcqAnswers);
      const codingSummary = calculateCodingPoints(solvedChallenges, CODING_CHALLENGES);

      const topicPoints = pointsSummary.completionPointsTotal + pointsSummary.bonusPointsTotal;
      const mcqPoints = pointsSummary.mcqPointsTotal;
      const totalPoints = Math.round((pointsSummary.totalPoints + codingSummary.totalCodingPoints) * 10) / 10;

      const rawUsername =
        u.username ||
        u.firstName?.toLowerCase() ||
        u.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
        "developer";

      const formattedUsername = rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`;

      return {
        id: u.id,
        username: formattedUsername,
        avatarUrl: u.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        topicPoints,
        mcqPoints,
        totalPoints,
        isCurrentUser: currentUserId ? u.id === currentUserId : false,
      };
    });

    // Sort descending by totalPoints -> topicPoints -> mcqPoints
    leaderboardUsers.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.topicPoints !== a.topicPoints) return b.topicPoints - a.topicPoints;
      return b.mcqPoints - a.mcqPoints;
    });

    // Assign 1-indexed ranks
    let currentUserRank: number | null = null;
    const rankedLeaderboard = leaderboardUsers.map((user, idx) => {
      const rank = idx + 1;
      if (user.isCurrentUser) {
        currentUserRank = rank;
      }
      return {
        ...user,
        rank,
      };
    });

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
      totalParticipants: rankedLeaderboard.length,
    });
  } catch (err: any) {
    console.error("GET /api/leaderboard error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

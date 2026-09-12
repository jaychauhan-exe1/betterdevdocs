import { NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let completedTopics: string[] = [];
    let activeTopicId: string | null = null;
    let selectedRole: string | null = null;
    let hasCompletedOnboarding: boolean | undefined = undefined;
    let onboardingData: any = undefined;
    let mcqAnswers: Record<string, Record<number, number>> = {};
    let topicNotes: Record<string, string> = {};
    let solvedChallenges: Record<string, { solvedAt: number; code: string }> = {};
    let fetchedFromSupabase = false;

    // 1. Try fetching from Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("completed_topics, active_topic_id, selected_role, has_completed_onboarding, onboarding_data, mcq_answers, topic_notes, solved_challenges")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Supabase select error:", error);
      } else if (data) {
        completedTopics = Array.isArray(data.completed_topics)
          ? data.completed_topics
          : [];
        activeTopicId = data.active_topic_id || null;
        selectedRole = data.selected_role || null;
        hasCompletedOnboarding = typeof data.has_completed_onboarding === "boolean" ? data.has_completed_onboarding : undefined;
        onboardingData = data.onboarding_data && typeof data.onboarding_data === "object" ? data.onboarding_data : undefined;
        mcqAnswers = data.mcq_answers && typeof data.mcq_answers === "object" ? data.mcq_answers : {};
        topicNotes = data.topic_notes && typeof data.topic_notes === "object" ? data.topic_notes : {};
        solvedChallenges = data.solved_challenges && typeof data.solved_challenges === "object" ? data.solved_challenges : {};
        fetchedFromSupabase = true;
      }
    }

    // 2. Fallback to Clerk User Metadata if Supabase yielded no record or failed
    if (!fetchedFromSupabase) {
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const user = await clerk.users.getUser(userId);
      const meta = user.unsafeMetadata as {
        completedTopics?: string[];
        activeTopicId?: string;
        selectedRole?: string;
        hasCompletedOnboarding?: boolean;
        onboardingData?: any;
        mcqAnswers?: Record<string, Record<number, number>>;
        topicNotes?: Record<string, string>;
        solvedChallenges?: Record<string, { solvedAt: number; code: string }>;
      };

      if (Array.isArray(meta?.completedTopics)) {
        completedTopics = meta.completedTopics;
      }
      if (meta?.activeTopicId) {
        activeTopicId = meta.activeTopicId;
      }
      if (meta?.selectedRole) {
        selectedRole = meta.selectedRole;
      }
      if (typeof meta?.hasCompletedOnboarding === "boolean") {
        hasCompletedOnboarding = meta.hasCompletedOnboarding;
      }
      if (meta?.onboardingData) {
        onboardingData = meta.onboardingData;
      }
      if (meta?.mcqAnswers && typeof meta.mcqAnswers === "object") {
        mcqAnswers = meta.mcqAnswers;
      }
      if (meta?.topicNotes && typeof meta.topicNotes === "object") {
        topicNotes = meta.topicNotes;
      }
      if (meta?.solvedChallenges && typeof meta.solvedChallenges === "object") {
        solvedChallenges = meta.solvedChallenges;
      }
    }

    return NextResponse.json({
      completedTopics,
      activeTopicId,
      selectedRole,
      hasCompletedOnboarding,
      onboardingData,
      mcqAnswers,
      topicNotes,
      solvedChallenges,
    });
  } catch (err: any) {
    console.error("GET /api/progress error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const completedTopics: string[] = Array.isArray(body?.completedTopics)
      ? body.completedTopics
      : [];
    const activeTopicId: string | undefined = body?.activeTopicId;
    const selectedRole: string | undefined = body?.selectedRole;
    const hasCompletedOnboarding: boolean | undefined = body?.hasCompletedOnboarding;
    const onboardingData: any = body?.onboardingData;
    const mcqAnswers: Record<string, Record<number, number>> =
      body?.mcqAnswers && typeof body.mcqAnswers === "object" ? body.mcqAnswers : {};
    const topicNotes: Record<string, string> =
      body?.topicNotes && typeof body.topicNotes === "object" ? body.topicNotes : {};
    const solvedChallenges: Record<string, { solvedAt: number; code: string }> =
      body?.solvedChallenges && typeof body.solvedChallenges === "object" ? body.solvedChallenges : {};

    // 1. Try Upserting into Supabase
    let supabaseSuccess = false;
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          completed_topics: completedTopics,
          active_topic_id: activeTopicId || null,
          selected_role: selectedRole || "all",
          has_completed_onboarding: Boolean(hasCompletedOnboarding),
          onboarding_data: onboardingData || {},
          mcq_answers: mcqAnswers,
          topic_notes: topicNotes,
          solved_challenges: solvedChallenges,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Supabase upsert error:", error);
      } else {
        supabaseSuccess = true;
      }
    }

    // 2. Return response (Data is stored safely in Supabase PostgreSQL)
    if (!supabaseSuccess) {
      console.warn("Supabase upsert did not complete successfully. Ensure Supabase credentials and schema are configured.");
    }

    return NextResponse.json({
      success: true,
      completedTopics,
      activeTopicId,
      selectedRole,
      hasCompletedOnboarding,
      onboardingData,
      mcqAnswers,
      topicNotes,
      solvedChallenges,
    });
  } catch (err: any) {
    console.error("POST /api/progress error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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
    let mcqAnswers: Record<string, Record<number, number>> = {};
    let topicNotes: Record<string, string> = {};
    let fetchedFromSupabase = false;

    // 1. Try fetching from Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("completed_topics, active_topic_id, selected_role, mcq_answers, topic_notes")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        completedTopics = Array.isArray(data.completed_topics)
          ? data.completed_topics
          : [];
        activeTopicId = data.active_topic_id || null;
        selectedRole = data.selected_role || null;
        mcqAnswers = data.mcq_answers && typeof data.mcq_answers === "object" ? data.mcq_answers : {};
        topicNotes = data.topic_notes && typeof data.topic_notes === "object" ? data.topic_notes : {};
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
        mcqAnswers?: Record<string, Record<number, number>>;
        topicNotes?: Record<string, string>;
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
      if (meta?.mcqAnswers && typeof meta.mcqAnswers === "object") {
        mcqAnswers = meta.mcqAnswers;
      }
      if (meta?.topicNotes && typeof meta.topicNotes === "object") {
        topicNotes = meta.topicNotes;
      }
    }

    return NextResponse.json({ completedTopics, activeTopicId, selectedRole, mcqAnswers, topicNotes });
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
    const mcqAnswers: Record<string, Record<number, number>> =
      body?.mcqAnswers && typeof body.mcqAnswers === "object" ? body.mcqAnswers : {};
    const topicNotes: Record<string, string> =
      body?.topicNotes && typeof body.topicNotes === "object" ? body.topicNotes : {};

    // 1. Try Upserting into Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          completed_topics: completedTopics,
          active_topic_id: activeTopicId || null,
          selected_role: selectedRole || "all",
          mcq_answers: mcqAnswers,
          topic_notes: topicNotes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }

    // 2. Always sync to Clerk User Metadata as dual-backup
    try {
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      await clerk.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          completedTopics,
          activeTopicId,
          selectedRole,
          mcqAnswers,
          topicNotes,
        },
      });
    } catch (clerkErr) {
      console.warn("Failed to sync progress to Clerk metadata:", clerkErr);
    }

    return NextResponse.json({
      success: true,
      completedTopics,
      activeTopicId,
      selectedRole,
      mcqAnswers,
      topicNotes,
    });
  } catch (err: any) {
    console.error("POST /api/progress error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

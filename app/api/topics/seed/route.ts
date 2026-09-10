import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TOPICS } from "@/data/topics";

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

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client unconfigured or missing keys" },
        { status: 500 }
      );
    }

    const formattedTopics = TOPICS.map((topic, index) => ({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      difficulty: topic.difficulty,
      estimated_time: topic.estimatedTime,
      is_important: topic.isImportant || false,
      summary: topic.summary,
      explanation: topic.explanation,
      key_takeaways: topic.keyTakeaways,
      code_examples: topic.codeExamples,
      mcqs: topic.mcqs,
      sort_order: index,
      created_at: new Date().toISOString(),
    }));

    // Batch upsert in chunks of 20 topics to prevent oversized payload
    const chunkSize = 20;
    let seededCount = 0;

    for (let i = 0; i < formattedTopics.length; i += chunkSize) {
      const chunk = formattedTopics.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("topics")
        .upsert(chunk, { onConflict: "id" });

      if (error) {
        console.error("Error seeding topics chunk:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      seededCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seededCount} topics into Supabase topics table.`,
      count: seededCount,
    });
  } catch (err: any) {
    console.error("POST /api/topics/seed error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

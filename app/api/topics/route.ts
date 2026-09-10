import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TOPICS, Topic } from "@/data/topics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const topics: Topic[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          difficulty: row.difficulty,
          estimatedTime: row.estimated_time,
          isImportant: row.is_important ?? false,
          summary: row.summary,
          explanation: row.explanation,
          keyTakeaways: row.key_takeaways || [],
          codeExamples: row.code_examples || [],
          mcqs: row.mcqs || [],
        }));

        return NextResponse.json(
          { topics },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            },
          }
        );
      }
    }
  } catch (err) {
    console.warn("Failed to fetch topics from database, using fallback:", err);
  }

  // Fallback to static local TOPICS if database is unreachable or empty
  return NextResponse.json(
    { topics: TOPICS },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

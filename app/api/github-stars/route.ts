import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // Try 1: ungh.cc (Universal GitHub API - fast & no strict rate limits)
  try {
    const res = await fetch("https://ungh.cc/repos/jaychauhan-exe1/devdocs", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.repo?.stars === "number") {
        return NextResponse.json(
          { stars: data.repo.stars },
          { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
        );
      }
    }
  } catch (err) {
    console.warn("Failed to fetch stars from ungh.cc", err);
  }

  // Try 2: Shields.io JSON API
  try {
    const res = await fetch("https://img.shields.io/github/stars/jaychauhan-exe1/devdocs.json", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const stars = parseInt(data?.value || data?.message, 10);
      if (!isNaN(stars)) {
        return NextResponse.json(
          { stars },
          { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
        );
      }
    }
  } catch (err) {
    console.warn("Failed to fetch stars from shields.io", err);
  }

  // Try 3: Direct GitHub REST API
  try {
    const res = await fetch("https://api.github.com/repos/jaychauhan-exe1/devdocs", {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "devdocs-app",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.stargazers_count === "number") {
        return NextResponse.json(
          { stars: data.stargazers_count },
          { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
        );
      }
    }
  } catch (err) {
    console.warn("Failed to fetch stars from GitHub API", err);
  }

  // Default fallback if all APIs fail
  return NextResponse.json({ stars: 0 });
}

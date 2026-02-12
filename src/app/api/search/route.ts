import { searchEpisodes } from "@/lib/services/search";
import { logger } from "@/lib/logger";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || undefined;
    const showId = searchParams.get("show") || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : [];
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const episodes = await searchEpisodes(
      {
        query,
        showId,
        tags,
        fromDate,
        toDate,
      },
      limit,
      offset
    );

    return NextResponse.json({ episodes, count: episodes.length });
  } catch (error) {
    logger.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}

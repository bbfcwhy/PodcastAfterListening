import { getAffiliateById, recordClick } from "@/lib/services/affiliates";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  try {
    const { affiliateId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const episodeId = searchParams.get("episodeId");

    // Get affiliate to get target URL
    const affiliate = await getAffiliateById(affiliateId);
    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get current user if authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Record click
    await recordClick(
      affiliateId,
      episodeId || null,
      user?.id || null,
      request.headers.get("user-agent") || null,
      request.headers.get("referer") || null
    );

    // Redirect to target URL
    return NextResponse.redirect(affiliate.target_url);
  } catch (error) {
    logger.error("Error in affiliate redirect:", error);
    return NextResponse.json(
      { error: "Failed to process redirect" },
      { status: 500 }
    );
  }
}

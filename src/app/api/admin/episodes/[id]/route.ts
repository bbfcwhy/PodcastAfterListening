import { deleteEpisode } from "@/lib/services/admin/episodes";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEpisode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting episode:", error);
    return NextResponse.json(
      { error: "Failed to delete episode" },
      { status: 500 }
    );
  }
}

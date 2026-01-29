import { createClient } from "@/lib/supabase/server";
import { Host } from "@/types/database";

export async function getHostsByShow(showId: string): Promise<Host[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("show_hosts")
    .select("hosts(*)")
    .eq("show_id", showId);

  if (error) {
    console.error("Error fetching hosts by show:", error);
    return [];
  }

  return data?.map((item: any) => item.hosts).filter(Boolean) || [];
}

import { createClient } from "@/lib/supabase/server";
import { AffiliateContent } from "@/types/database";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export type GetAffiliatesOptions = {
  page?: number;
  pageSize?: number;
};

export async function getAffiliates(
  options: GetAffiliatesOptions = {}
): Promise<{ items: AffiliateContent[]; total: number }> {
  const supabase = await createClient();
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("affiliate_contents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching affiliates:", error);
    throw error;
  }

  return { items: data || [], total: count ?? 0 };
}

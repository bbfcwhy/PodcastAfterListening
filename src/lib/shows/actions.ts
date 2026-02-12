"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/server";
import { isAdmin } from "@/lib/auth/admin";
import type { Show } from "@/types/database";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export interface GetAdminShowsParams {
    page?: number;
    perPage?: number;
    sort?: "custom" | "created_asc" | "created_desc" | "name_asc" | "name_desc";
    filter?: string;
    category?: string;
}

export interface AdminShowsResult {
    data: Show[];
    count: number;
}

export async function getAdminShows({
    page = 1,
    perPage = 10,
    sort = "custom",
    filter,
    category,
}: GetAdminShowsParams): Promise<AdminShowsResult> {
    const user = await getCurrentUser();



    if (!user || !isAdmin(user.email)) {
        throw new Error("Unauthorized");
    }

    const supabase = await createClient();
    let query = supabase.from("shows").select("*", { count: "exact" });

    // Filter
    if (filter) {
        query = query.or(`name.ilike.%${filter}%,description.ilike.%${filter}%`);
    }

    if (category) {
        query = query.contains("show_categories", [category]);
    }

    // Sort
    switch (sort) {
        case "name_asc":
            query = query.order("name", { ascending: true });
            break;
        case "name_desc":
            query = query.order("name", { ascending: false });
            break;
        case "created_asc":
            query = query.order("created_at", { ascending: true });
            break;
        case "created_desc":
            query = query.order("created_at", { ascending: false });
            break;
        case "custom":
        default:
            query = query.order("position", { ascending: true });
            break;
    }

    // Pagination
    // If perPage is very large (e.g. 10000 for "Show All"), it behaves like show all.
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        logger.error("Error fetching admin shows:", error);
        throw new Error("Failed to fetch shows");
    }



    return {
        data: data || [],
        count: count || 0,
    };
}

export async function updateShowOrder(
    items: { id: string; position: number }[]
) {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.email)) {
        throw new Error("Unauthorized");
    }

    const supabase = await createClient();

    // Parallel update


    // For larger sets, we might want to consider a Postgres Function (RPC),
    // but for admin sorting, this should be acceptable.
    const updates = items.map((item) =>
        supabase.from("shows")
            .update({ position: item.position })
            .eq("id", item.id)
            .select() // Add select to verify the update happened
    );

    const results = await Promise.all(updates);

    // Log success/failure details
    const _successfulUpdates = results.filter(r => r.data && r.data.length > 0);
    const _failedUpdates = results.filter(r => r.error || !r.data || r.data.length === 0);



    const hasError = results.some((r) => r.error);
    if (hasError) {
        logger.error("Error updating show order:", results.filter(r => r.error).map(r => r.error));
        throw new Error("Failed to update show order");
    }

    // Revalidate specific path and layout
    revalidatePath("/shows");
    revalidatePath("/", "layout");
}

export async function getShowCategories(): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("shows")
        .select("show_categories");

    if (error) {
        logger.error("Error fetching categories (Full Details):", JSON.stringify(error, null, 2));
        return [];
    }

    const categories = new Set<string>();
    data.forEach((row: { show_categories?: string[] | null }) => {
        if (row.show_categories) {
            row.show_categories.forEach((cat: string) => categories.add(cat));
        }
    });

    return Array.from(categories).sort();
}

import { getCurrentUser } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { LibraryList } from "@/components/library/LibraryList";
import { MainLayout } from "@/components/layout/MainLayout";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "我的收藏庫 - Podcast 聽了以後",
};

export default async function LibraryPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    const supabase = await createClient();
    const { data: libraryItems, error } = await supabase
        .from("library_items")
        .select(`
      *,
      show:shows(*)
    `)
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .order("added_at", { ascending: false });

    if (error) {
        logger.error("Error fetching library items:", error);
        // Handle error gracefully or throw
    }

    // Type assertion or data transformation might be needed if Supabase types are strict
    // The query returns library_items with joined show data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedItems = (libraryItems || []).map((item: any) => ({
        ...item,
        show: item.show, // Supabase returns single object for one-to-one/many-to-one if configured correctly? 
        // Actually returns array or object depending on relationship.
        // Assuming shows relation is correct.
        // It is actually many-to-one: library_item belongs to show.
        // So show:shows(*) should return `show: { ... }` object.
    }));

    // Filter out items where show might be null (if soft deleted?)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validItems = formattedItems.filter((item: any) => item.show !== null);

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-12 px-4 md:px-10">
                <h1 className="text-3xl font-black mb-8 text-text-primary">我的收藏庫</h1>
                <LibraryList items={validItems} />
            </div>
        </MainLayout>
    );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToLibrary(showId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase.from("library_items").insert({
        user_id: user.id,
        show_id: showId,
    });

    if (error) {
        // Ignore duplicate error (unique constraint)
        if (error.code === '23505') return;
        throw error;
    }

    revalidatePath("/library");
}

export async function removeFromLibrary(showId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("library_items")
        .delete()
        .match({ user_id: user.id, show_id: showId });

    if (error) {
        throw error;
    }

    revalidatePath("/library");
}

export async function updateLibraryOrder(items: { id: string; position: number }[]) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Update positions in batch or loop
    // Supabase doesn't support batch update easily via client lib for different values
    // So we loop. Improve with RPC if performance needed.
    for (const item of items) {
        await supabase.from("library_items").update({ position: item.position }).eq("id", item.id).eq("user_id", user.id);
    }

    revalidatePath("/library");
}

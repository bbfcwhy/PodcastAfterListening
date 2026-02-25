"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEpisodeToLibrary(episodeId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("未登入");
    }

    const { error } = await supabase.from("episode_library_items").insert({
        user_id: user.id,
        episode_id: episodeId,
    });

    if (error) {
        if (error.code === "23505") return;
        throw new Error(error.message);
    }

    revalidatePath("/library");
}

export async function removeEpisodeFromLibrary(episodeId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("未登入");
    }

    const { error } = await supabase
        .from("episode_library_items")
        .delete()
        .match({ user_id: user.id, episode_id: episodeId });

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/library");
}

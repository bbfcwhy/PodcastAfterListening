
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getShows() {
    const { data, error } = await supabase
        .from("shows")
        .select("*, episodes(count)")
        .eq("episodes.is_published", true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

async function getLatestEpisodes(limit = 12) {
    const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

async function main() {
    try {
        console.log("Testing getShows...");
        const shows = await getShows();
        console.log(`getShows returned ${shows.length} shows.`);
        if (shows.length > 0) {
            console.log("First show:", shows[0].name, "Count:", shows[0].episodes[0].count);
        }

        console.log("Testing getLatestEpisodes...");
        const episodes = await getLatestEpisodes();
        console.log(`getLatestEpisodes returned ${episodes.length} episodes.`);

    } catch (err) {
        console.error("Error:", err);
    }
}

main();

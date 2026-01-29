import { MainLayout } from "@/components/layout/MainLayout";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { searchEpisodes } from "@/lib/services/search";
import { getShows } from "@/lib/services/shows";
import { createClient } from "@/lib/supabase/server";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    show?: string;
    fromDate?: string;
    toDate?: string;
    tags?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const showId = params.show;
  const fromDate = params.fromDate;
  const toDate = params.toDate;
  const tags = params.tags ? params.tags.split(",") : [];

  // Fetch shows and tags for filters
  const shows = await getShows();
  const supabase = await createClient();
  const { data: allTags } = await supabase.from("tags").select("*");

  // Perform search
  const episodes = await searchEpisodes({
    query,
    showId,
    tags,
    fromDate,
    toDate,
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">搜尋節目</h1>
          <SearchBar initialQuery={query} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SearchFilters
              shows={shows}
              tags={allTags || []}
            />
          </div>
          <div className="lg:col-span-3">
            <SearchResults episodes={episodes} shows={shows} query={query} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { MainLayout } from "@/components/layout/MainLayout";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { searchEpisodes } from "@/lib/services/search";
import { getShows } from "@/lib/services/shows";
import { createClient } from "@/lib/supabase/server";
import { formatEpisodeDate } from "@/lib/utils/date-formatter";

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

  // 預先格式化日期，避免 hydration mismatch
  const episodesWithFormattedDates = episodes.map(ep => ({
    ...ep,
    formattedPublishedDate: formatEpisodeDate(ep.published_at)
  }));

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-12 md:py-16 px-4 md:px-10">
        {/* Search Header */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-black mb-6 text-text-primary">搜尋節目</h1>
          <SearchBar initialQuery={query} />
        </div>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <SearchFilters
              shows={shows}
              tags={allTags || []}
            />
          </aside>
          {/* Main Results */}
          <main className="flex-1 min-w-0">
            <SearchResults episodes={episodesWithFormattedDates} shows={shows} query={query} />
          </main>
        </div>
      </div>
    </MainLayout>
  );
}

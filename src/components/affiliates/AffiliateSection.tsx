import { AffiliateCard } from "./AffiliateCard";
import { AffiliateContent } from "@/types/database";
import { EmptyState } from "@/components/ui/EmptyState";

interface AffiliateSectionProps {
  affiliates: AffiliateContent[];
  episodeId: string;
}

export function AffiliateSection({
  affiliates,
  episodeId,
}: AffiliateSectionProps) {
  if (affiliates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">相關推薦</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {affiliates.map((affiliate) => (
          <AffiliateCard
            key={affiliate.id}
            id={affiliate.id}
            title={affiliate.title}
            description={affiliate.description}
            targetUrl={affiliate.target_url}
            imageUrl={affiliate.image_url}
            episodeId={episodeId}
          />
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SponsorshipSectionProps {
  sponsorship: string | null;
}

export function SponsorshipSection({ sponsorship }: SponsorshipSectionProps) {
  if (!sponsorship) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>業配內容</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{sponsorship}</p>
        </div>
      </CardContent>
    </Card>
  );
}

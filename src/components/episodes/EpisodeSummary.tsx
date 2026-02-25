import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EpisodeSummaryProps {
  summary: string | null;
}

export function EpisodeSummary({ summary }: EpisodeSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>節目大綱</CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">內容準備中</p>
        )}
      </CardContent>
    </Card>
  );
}

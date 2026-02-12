import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TranscriptSectionProps {
    transcript: string | null;
}

export function TranscriptSection({ transcript }: TranscriptSectionProps) {
    if (!transcript) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>逐字稿</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose max-w-none max-h-96 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{transcript}</p>
                </div>
            </CardContent>
        </Card>
    );
}

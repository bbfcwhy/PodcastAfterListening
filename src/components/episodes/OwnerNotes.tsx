import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OwnerNotesProps {
  notes: string | null;
}

export function OwnerNotes({ notes }: OwnerNotesProps) {
  if (!notes) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>站長心得</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{notes}</p>
        </div>
      </CardContent>
    </Card>
  );
}

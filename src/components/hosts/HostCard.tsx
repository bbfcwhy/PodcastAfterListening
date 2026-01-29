import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface HostCardProps {
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

export function HostCard({ name, bio, avatarUrl }: HostCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={avatarUrl || undefined} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{name}</h3>
          {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

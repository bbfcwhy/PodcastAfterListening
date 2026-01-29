import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface CommentItemProps {
  id: string;
  content: string;
  userName: string | null;
  userAvatar: string | null;
  createdAt: string;
}

export function CommentItem({
  content,
  userName,
  userAvatar,
  createdAt,
}: CommentItemProps) {
  const displayName = userName || "匿名用戶";
  const initials = displayName.slice(0, 2).toUpperCase();
  const formattedDate = format(new Date(createdAt), "yyyy年MM月dd日 HH:mm", {
    locale: zhTW,
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={userAvatar || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{displayName}</span>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

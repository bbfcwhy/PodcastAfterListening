import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Comment } from "@/types/database";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CommentActions } from "./CommentActions";

interface CommentModerationTableProps {
  comments: Comment[];
}

export function CommentModerationTable({
  comments,
}: CommentModerationTableProps) {

  const statusLabels: Record<string, string> = {
    pending: "待審核",
    approved: "已批准",
    hidden: "已隱藏",
    spam: "垃圾",
  };

  const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
    pending: "secondary",
    approved: "default",
    hidden: "secondary",
    spam: "destructive",
  };

  return (
    <Table className="bg-surface">
      <TableHeader>
        <TableRow className="border-border-subtle">
          <TableHead className="text-text-primary">內容</TableHead>
          <TableHead className="text-text-primary">狀態</TableHead>
          <TableHead className="text-text-primary">垃圾分數</TableHead>
          <TableHead className="text-text-primary">建立時間</TableHead>
          <TableHead className="text-right text-text-primary">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.length === 0 ? (
          <TableRow className="border-border-subtle">
            <TableCell colSpan={5} className="text-center text-text-secondary">
              尚無留言
            </TableCell>
          </TableRow>
        ) : (
          comments.map((comment) => (
            <TableRow key={comment.id} className="border-border-subtle hover:bg-hover">
              <TableCell className="max-w-md">
                <p className="truncate">{comment.content}</p>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[comment.status] || "secondary"}>
                  {statusLabels[comment.status] || comment.status}
                </Badge>
              </TableCell>
              <TableCell>
                {(comment.spam_score * 100).toFixed(0)}%
              </TableCell>
              <TableCell>
                {format(new Date(comment.created_at), "yyyy-MM-dd HH:mm", {
                  locale: zhTW,
                })}
              </TableCell>
              <TableCell className="text-right">
                <CommentActions
                  commentId={comment.id}
                  currentStatus={comment.status}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

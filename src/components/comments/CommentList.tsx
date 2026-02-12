"use client";

import { CommentItem } from "./CommentItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Comment } from "@/types/database";

interface CommentWithUser extends Comment {
  user?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentListProps {
  comments: CommentWithUser[];
  loading?: boolean;
  episodeId: string;
}

export function CommentList({ comments, loading, episodeId: _episodeId }: CommentListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (comments.length === 0) {
    return (
      <EmptyState
        title="尚無留言"
        description="成為第一個留言的人吧！"
      />
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          id={comment.id}
          content={comment.content}
          userName={comment.user?.display_name || null}
          userAvatar={comment.user?.avatar_url || null}
          createdAt={comment.created_at}
        />
      ))}
    </div>
  );
}

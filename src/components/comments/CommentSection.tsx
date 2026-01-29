"use client";

import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comment } from "@/types/database";
import useSWR from "swr";

interface CommentWithUser extends Comment {
  user?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  episodeId: string;
  initialComments?: CommentWithUser[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()).then((data) => data.comments || []);

export function CommentSection({
  episodeId,
  initialComments = [],
}: CommentSectionProps) {
  const { data: comments, mutate, isLoading } = useSWR<CommentWithUser[]>(
    `/api/comments/${episodeId}`,
    fetcher,
    {
      fallbackData: initialComments,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const refreshComments = () => {
    mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>討論區 ({comments?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CommentForm episodeId={episodeId} onCommentAdded={refreshComments} />
        <div className="border-t pt-6">
          <CommentList
            comments={comments || []}
            loading={isLoading}
            episodeId={episodeId}
          />
        </div>
      </CardContent>
    </Card>
  );
}

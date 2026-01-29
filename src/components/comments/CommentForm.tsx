"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginButtons } from "@/components/auth/LoginButton";
import { toast } from "sonner";

interface CommentFormProps {
  episodeId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ episodeId, onCommentAdded }: CommentFormProps) {
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("請先登入");
      return;
    }

    if (!content.trim()) {
      toast.error("請輸入留言內容");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${episodeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "留言發布失敗");
      }

      toast.success("留言已發布");
      setContent("");
      onCommentAdded?.();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error(
        error instanceof Error ? error.message : "留言發布失敗，請稍後再試"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="text-muted-foreground">載入中...</div>;
  }

  if (!user) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          請先登入以發表留言
        </p>
        <LoginButtons />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="分享你的想法..."
        rows={4}
        disabled={submitting}
        maxLength={1000}
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {content.length}/1000
        </span>
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "發布中..." : "發布留言"}
        </Button>
      </div>
    </form>
  );
}

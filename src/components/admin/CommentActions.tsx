"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { Check, Eye, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CommentActionsProps {
  commentId: string;
  currentStatus: string;
}

export function CommentActions({
  commentId,
  currentStatus,
}: CommentActionsProps) {
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("留言狀態已更新");
        router.refresh();
      } else {
        throw new Error("更新失敗");
      }
    } catch (error) {
      logger.error("Error updating comment status:", error);
      toast.error("更新留言狀態失敗");
    }
  };

  return (
    <div className="flex justify-end gap-2 flex-wrap">
      {currentStatus !== "approved" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange("approved")}
          title="通過"
          aria-label="通過"
        >
          <Check className="h-4 w-4 mr-1" />
          通過
        </Button>
      )}
      {currentStatus !== "hidden" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange("hidden")}
          title="隱藏"
          aria-label="隱藏"
        >
          <Eye className="h-4 w-4 mr-1" />
          隱藏
        </Button>
      )}
      {currentStatus !== "spam" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange("spam")}
          title="標記垃圾"
          aria-label="標記垃圾"
        >
          <Ban className="h-4 w-4 mr-1" />
          標記垃圾
        </Button>
      )}
    </div>
  );
}

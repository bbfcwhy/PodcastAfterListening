"use client";

import { Button } from "@/components/ui/button";
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
      console.error("Error updating comment status:", error);
      toast.error("更新留言狀態失敗");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {currentStatus !== "approved" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange("approved")}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
      {currentStatus !== "hidden" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange("hidden")}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {currentStatus !== "spam" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusChange("spam")}
        >
          <Ban className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

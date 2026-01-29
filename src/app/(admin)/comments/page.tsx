import { getCommentsByStatus } from "@/lib/services/admin/comments";
import { CommentModerationTable } from "@/components/admin/CommentModerationTable";
import Link from "next/link";

interface AdminCommentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  const params = await searchParams;
  const status = (params.status ||
    "pending") as "pending" | "approved" | "hidden" | "spam" | "all";

  const comments = await getCommentsByStatus(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">留言審核</h1>
        <p className="text-muted-foreground mt-2">管理與審核訪客留言</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 border-b">
          <Link
            href="/admin/comments?status=pending"
            className={`px-4 py-2 border-b-2 ${
              status === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            待審核
          </Link>
          <Link
            href="/admin/comments?status=approved"
            className={`px-4 py-2 border-b-2 ${
              status === "approved"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            已批准
          </Link>
          <Link
            href="/admin/comments?status=hidden"
            className={`px-4 py-2 border-b-2 ${
              status === "hidden"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            已隱藏
          </Link>
          <Link
            href="/admin/comments?status=spam"
            className={`px-4 py-2 border-b-2 ${
              status === "spam"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            垃圾
          </Link>
          <Link
            href="/admin/comments?status=all"
            className={`px-4 py-2 border-b-2 ${
              status === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            全部
          </Link>
        </div>
        <CommentModerationTable comments={comments} />
      </div>
    </div>
  );
}

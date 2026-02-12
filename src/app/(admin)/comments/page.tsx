import { getCommentsByStatus } from "@/lib/services/admin/comments";
import { CommentModerationTable } from "@/components/admin/CommentModerationTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import Link from "next/link";

interface AdminCommentsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  const params = await searchParams;
  const status = (params.status ||
    "pending") as "pending" | "approved" | "hidden" | "spam" | "all";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const result = await getCommentsByStatus(status, { page, pageSize });
  const { items: comments, total } =
    typeof result === "object" && "items" in result && "total" in result
      ? result
      : { items: Array.isArray(result) ? result : [], total: 0 };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">留言審核</h1>
        <p className="text-text-secondary mt-2">管理與審核訪客留言</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 border-b border-border-subtle">
          <Link
            href="/comments?status=pending"
            className={`px-4 py-2 border-b-2 ${
              status === "pending"
                ? "border-cta text-cta"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            待審核
          </Link>
          <Link
            href="/comments?status=approved"
            className={`px-4 py-2 border-b-2 ${
              status === "approved"
                ? "border-cta text-cta"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            已批准
          </Link>
          <Link
            href="/comments?status=hidden"
            className={`px-4 py-2 border-b-2 ${
              status === "hidden"
                ? "border-cta text-cta"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            已隱藏
          </Link>
          <Link
            href="/comments?status=spam"
            className={`px-4 py-2 border-b-2 ${
              status === "spam"
                ? "border-cta text-cta"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            垃圾
          </Link>
          <Link
            href="/comments?status=all"
            className={`px-4 py-2 border-b-2 ${
              status === "all"
                ? "border-cta text-cta"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            全部
          </Link>
        </div>
        <CommentModerationTable comments={comments} />
      </div>
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        searchParams={{ status }}
      />
    </div>
  );
}

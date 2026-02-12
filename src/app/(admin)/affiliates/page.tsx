import { getAffiliates } from "@/lib/services/admin/affiliates";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const { items: affiliates, total } = await getAffiliates({ page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">聯盟行銷管理</h1>
          <p className="text-text-secondary mt-2">
            管理聯盟行銷內容
          </p>
        </div>
        <Button asChild className="bg-cta text-text-primary hover:bg-cta/90">
          <Link href="/affiliates/new">
            <Plus className="mr-2 h-4 w-4" />
            新增內容
          </Link>
        </Button>
      </div>

      <Table className="bg-surface">
        <TableHeader>
          <TableRow className="border-border-subtle">
            <TableHead className="text-text-primary">標題</TableHead>
            <TableHead className="text-text-primary">目標連結</TableHead>
            <TableHead className="text-text-primary">狀態</TableHead>
            <TableHead className="text-text-primary">建立時間</TableHead>
            <TableHead className="text-right text-text-primary">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates && affiliates.length > 0 ? (
            affiliates.map((affiliate) => (
              <TableRow key={affiliate.id} className="border-border-subtle hover:bg-hover">
                <TableCell className="font-medium text-text-primary">{affiliate.title}</TableCell>
                <TableCell>
                  <a
                    href={affiliate.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cta hover:underline"
                  >
                    {affiliate.target_url}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                    {affiliate.is_active ? "啟用" : "停用"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(affiliate.created_at).toLocaleDateString("zh-TW")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/affiliates/${affiliate.id}/edit`}>
                      編輯
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-border-subtle">
              <TableCell colSpan={5} className="text-center text-text-secondary">
                尚無聯盟行銷內容
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        searchParams={{}}
      />
    </div>
  );
}

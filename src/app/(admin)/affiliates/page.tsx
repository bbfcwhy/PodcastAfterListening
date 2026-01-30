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
          <h1 className="text-3xl font-bold">聯盟行銷管理</h1>
          <p className="text-muted-foreground mt-2">
            管理聯盟行銷內容
          </p>
        </div>
        <Button asChild>
          <Link href="/affiliates/new">
            <Plus className="mr-2 h-4 w-4" />
            新增內容
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>標題</TableHead>
            <TableHead>目標連結</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>建立時間</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates && affiliates.length > 0 ? (
            affiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell className="font-medium">{affiliate.title}</TableCell>
                <TableCell>
                  <a
                    href={affiliate.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
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
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
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

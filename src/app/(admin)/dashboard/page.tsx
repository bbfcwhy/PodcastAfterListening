import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get episode count
  const { count: episodeCount } = await supabase
    .from("episodes")
    .select("*", { count: "exact", head: true });

  // Get published episode count
  const { count: publishedCount } = await supabase
    .from("episodes")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  // Get comment count
  const { count: commentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true });

  // Get pending comment count
  const { count: pendingCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">管理儀表板</h1>
        <p className="text-muted-foreground mt-2">
          歡迎回來！這裡是網站內容管理的總覽。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總節目數</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{episodeCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              已發布：{publishedCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總留言數</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commentCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              待審核：{pendingCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

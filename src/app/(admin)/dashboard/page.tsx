import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  MessageSquare,
  Radio,
  ScrollText,
  Megaphone,
  Headphones,
  BookOpen,
  Eye,
  EyeOff,
  Tag,
} from "lucide-react";

function pct(n: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // --- Parallel queries ---
  const [
    { count: episodeCount },
    { count: publishedCount },
    { count: unpublishedCount },
    { count: commentCount },
    { count: pendingCommentCount },
    { count: showCount },
    { count: tagCount },
    { count: transcriptCount },
    { count: outlineCount },
    { count: sponsorshipCount },
    { count: reflectionCount },
  ] = await Promise.all([
    supabase.from("episodes").select("*", { count: "exact", head: true }),
    supabase.from("episodes").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("episodes").select("*", { count: "exact", head: true }).eq("is_published", false),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("shows").select("*", { count: "exact", head: true }),
    supabase.from("tags").select("*", { count: "exact", head: true }),
    // Count non-null content fields directly in DB (avoid 1000-row default limit)
    supabase.from("episodes").select("*", { count: "exact", head: true }).not("transcript", "is", null).neq("transcript", ""),
    supabase.from("episodes").select("*", { count: "exact", head: true }).not("ai_summary", "is", null).neq("ai_summary", ""),
    supabase.from("episodes").select("*", { count: "exact", head: true }).not("ai_sponsorship", "is", null).neq("ai_sponsorship", ""),
    supabase.from("episodes").select("*", { count: "exact", head: true }).not("reflection", "is", null).neq("reflection", ""),
  ]);

  const total = episodeCount || 0;

  const withTranscript = transcriptCount ?? 0;
  const withOutline = outlineCount ?? 0;
  const withSponsorship = sponsorshipCount ?? 0;
  const withReflection = reflectionCount ?? 0;

  // "Four complete" — all 4 content fields present
  const { count: fullyCompleteCount } = await supabase
    .from("episodes")
    .select("*", { count: "exact", head: true })
    .not("transcript", "is", null).neq("transcript", "")
    .not("ai_summary", "is", null).neq("ai_summary", "")
    .not("ai_sponsorship", "is", null).neq("ai_sponsorship", "")
    .not("reflection", "is", null).neq("reflection", "");
  const fullyComplete = fullyCompleteCount ?? 0;

  const stats = [
    {
      title: "總單集數",
      icon: FileText,
      value: total,
      sub: `已發布：${publishedCount || 0}`,
    },
    {
      title: "節目數",
      icon: Radio,
      value: showCount || 0,
      sub: `標籤：${tagCount || 0} 個`,
    },
    {
      title: "已發布",
      icon: Eye,
      value: publishedCount || 0,
      sub: pct(publishedCount || 0, total),
    },
    {
      title: "未發布",
      icon: EyeOff,
      value: unpublishedCount || 0,
      sub: pct(unpublishedCount || 0, total),
    },
  ];

  const contentBreakdown = [
    {
      title: "逐字稿",
      icon: ScrollText,
      done: withTranscript,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "內容大綱",
      icon: BookOpen,
      done: withOutline,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "業配資訊",
      icon: Megaphone,
      done: withSponsorship,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "站長聽後感",
      icon: Headphones,
      done: withReflection,
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">管理儀表板</h1>
        <p className="text-text-secondary mt-2">
          歡迎回來！這裡是網站內容管理的總覽。
        </p>
      </div>

      {/* --- Row 1: Overview cards --- */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="bg-surface border-border-subtle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-primary">
                {s.title}
              </CardTitle>
              <s.icon className="h-4 w-4 text-text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                {s.value.toLocaleString()}
              </div>
              <p className="text-xs text-text-secondary">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Row 2: Content completion --- */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          AI 內容產出進度
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {contentBreakdown.map((c) => {
            const missing = total - c.done;
            const percentage = pct(c.done, total);
            return (
              <Card key={c.title} className="bg-surface border-border-subtle">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-text-primary">
                    {c.title}
                  </CardTitle>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-text-primary">
                    {percentage}
                  </div>
                  <p className="text-xs text-text-secondary">
                    {c.done.toLocaleString()} / {total.toLocaleString()}
                    {missing > 0 && `（缺 ${missing.toLocaleString()}）`}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-border-subtle/50">
                    <div
                      className={`h-1.5 rounded-full ${c.color.includes("blue") ? "bg-blue-500" : c.color.includes("emerald") ? "bg-emerald-500" : c.color.includes("amber") ? "bg-amber-500" : "bg-purple-500"}`}
                      style={{ width: percentage }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* --- Row 3: Completeness + Comments --- */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-surface border-border-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">
              四項全齊的單集
            </CardTitle>
            <Tag className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {fullyComplete.toLocaleString()}
              <span className="text-sm font-normal text-text-secondary ml-2">
                / {total.toLocaleString()}（{pct(fullyComplete, total)}）
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              同時擁有逐字稿、大綱、業配、聽後感
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border-subtle/50">
              <div
                className="h-1.5 rounded-full bg-cta"
                style={{ width: pct(fullyComplete, total) }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">
              留言概覽
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {(commentCount || 0).toLocaleString()}
            </div>
            <p className="text-xs text-text-secondary">
              待審核：{pendingCommentCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

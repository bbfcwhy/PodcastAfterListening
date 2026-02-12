import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

/**
 * 格式化 Episode 的發布日期
 * 在 Server Component 中使用，避免 hydration mismatch
 */
export function formatEpisodeDate(dateString: string | null): string | null {
    if (!dateString) return null;
    return format(new Date(dateString), "yyyy年MM月dd日", { locale: zhTW });
}

/**
 * 格式化留言的建立日期
 * 在 Server Component 中使用，避免 hydration mismatch
 */
export function formatCommentDate(dateString: string): string {
    return format(new Date(dateString), "yyyy年MM月dd日 HH:mm", { locale: zhTW });
}

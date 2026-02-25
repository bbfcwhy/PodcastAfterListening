# Data Model: Library 頁面「我的留言」Tab

**Feature Branch**: `009-library-commented-tab`
**Date**: 2026-02-25

## 現有 Entity（不變更）

### comments（留言）

| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | UUID | PK | 主鍵 |
| episode_id | UUID | FK → podcast_episodes(id), NOT NULL | 所屬單集 |
| user_id | UUID | FK → auth.users(id), NOT NULL | 留言者 |
| content | TEXT | NOT NULL | 留言內容 |
| status | TEXT | CHECK (pending/approved/hidden/spam), DEFAULT 'pending' | 留言狀態 |
| spam_score | REAL | DEFAULT 0, CHECK (0-1) | 垃圾評分 |
| created_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | 建立時間 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | 更新時間 |

**索引**: `idx_comments_user_id`, `idx_comments_episode_id`, `idx_comments_status`

### episodes（VIEW → podcast_episodes）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| show_id | UUID | FK → shows(id) |
| title | TEXT | 單集標題 |
| slug | TEXT | URL 路徑段 |
| published_at | DATE | 發佈日期 |
| ... | ... | 其他欄位省略 |

### shows（頻道）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| name | TEXT | 頻道名稱 |
| slug | TEXT | URL 路徑段 |
| cover_image_url | TEXT | 封面圖 |

## 新增 Entity

**無** — 本功能不需要新增資料表，僅查詢現有的 `comments` 表。

## 查詢模型

### 「我的留言」單集列表查詢

```text
步驟 1: 查詢使用者的 approved 留言
FROM comments
SELECT episode_id, created_at
WHERE user_id = current_user AND status = 'approved'
ORDER BY created_at DESC

步驟 2: 應用層分組
GROUP BY episode_id → { episode_id, comment_count, latest_comment_at }

步驟 3: 查詢單集詳情
FROM episodes (VIEW)
SELECT *, show:shows(name, slug, cover_image_url)
WHERE id IN (grouped_episode_ids)
FILTER: episode IS NOT NULL（過濾已刪除的單集）

步驟 4: 合併並排序
合併步驟 2 和步驟 3 的結果
ORDER BY latest_comment_at DESC
```

## Entity 關係圖

```text
auth.users
  │
  └──< comments >──── podcast_episodes ──── shows
       (user_id,       (episode_id)         (show_id)
        status)
                       ↑
                   episodes (VIEW)
```

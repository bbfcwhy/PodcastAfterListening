# Data Model: Library 收藏功能修復與單集收藏

**Feature Branch**: `008-library-episode-bookmarks`
**Date**: 2026-02-25

## 現有 Entity（不變更）

### library_items（頻道收藏）

| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 主鍵 |
| user_id | UUID | FK → auth.users(id) ON DELETE CASCADE, NOT NULL | 使用者 |
| show_id | UUID | FK → shows(id) ON DELETE CASCADE, NOT NULL | 頻道 |
| position | INTEGER | DEFAULT 0 | 排序位置 |
| added_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | 收藏時間 |

**唯一約束**: UNIQUE(user_id, show_id)

### shows（頻道）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| name | TEXT | 頻道名稱 |
| slug | TEXT | URL 路徑段 |
| description | TEXT | 頻道描述 |
| cover_image_url | TEXT | 封面圖 |
| ... | ... | 其他欄位省略 |

### episodes（單集）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| show_id | UUID | FK → shows(id)，所屬頻道 |
| title | TEXT | 單集標題 |
| slug | TEXT | URL 路徑段 |
| description | TEXT | 單集描述 |
| published_at | TIMESTAMPTZ | 發佈日期 |
| show_slug | TEXT | 所屬頻道的 slug |
| ... | ... | 其他欄位省略 |

---

## 新增 Entity

### episode_library_items（單集收藏）

| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 主鍵 |
| user_id | UUID | FK → auth.users(id) ON DELETE CASCADE, NOT NULL | 使用者 |
| episode_id | UUID | FK → episodes(id) ON DELETE CASCADE, NOT NULL | 單集 |
| added_at | TIMESTAMPTZ | DEFAULT NOW(), NOT NULL | 收藏時間 |

**唯一約束**: UNIQUE(user_id, episode_id)

**不包含 position 欄位**：單集收藏按收藏時間倒序排列，不支援手動排序。

### RLS 政策

```sql
-- SELECT: 使用者只能查看自己的單集收藏
CREATE POLICY episode_library_items_select ON episode_library_items
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: 使用者只能新增自己的單集收藏
CREATE POLICY episode_library_items_insert ON episode_library_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: 使用者只能刪除自己的單集收藏
CREATE POLICY episode_library_items_delete ON episode_library_items
  FOR DELETE USING (auth.uid() = user_id);
```

**注意**：不需要 UPDATE 政策，因為單集收藏沒有可更新的欄位（不支援排序）。

---

## Entity 關係圖

```text
auth.users
  │
  ├──< library_items >──── shows
  │    (user_id, show_id)
  │
  └──< episode_library_items >──── episodes >──── shows
       (user_id, episode_id)         (show_id)
```

- 一個使用者可收藏多個頻道（1:N via library_items）
- 一個使用者可收藏多個單集（1:N via episode_library_items）
- 頻道收藏和單集收藏完全獨立
- 單集透過 show_id 關聯到頻道（用於顯示所屬頻道名稱）

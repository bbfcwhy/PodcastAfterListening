# Data Model: Podcast 聽後回顧網站

**Date**: 2026-01-28
**Branch**: `001-podcast-review-site`

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Show     │──1:N──│   Episode   │──N:M──│     Tag     │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │
       │                     │
      1:N                   1:N
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    Host     │       │   Comment   │
└─────────────┘       └─────────────┘
                             │
                            N:1
                             │
                             ▼
                      ┌─────────────┐
                      │    User     │
                      │ (auth.users)│
                      └─────────────┘

┌─────────────────┐
│ AffiliateContent│──N:M──Episode
└─────────────────┘
```

## Entities

### Show (節目系列)

代表一個 Podcast 節目系列。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| name | TEXT | NOT NULL | 節目名稱 |
| slug | TEXT | NOT NULL, UNIQUE | URL 友善名稱 |
| description | TEXT | | 節目描述 |
| cover_image_url | TEXT | | 封面圖片 URL |
| original_url | TEXT | | 原始 Podcast 頁面連結 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 更新時間 |

**Indexes**:
- `idx_shows_slug` on (slug)
- `idx_shows_name_search` GIN on (to_tsvector('chinese', name || ' ' || coalesce(description, '')))

---

### Host (主持人)

節目主持人資訊，與 Show 為多對多關係（透過 show_hosts 中介表）。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| name | TEXT | NOT NULL | 姓名 |
| bio | TEXT | | 簡介 |
| avatar_url | TEXT | | 頭像 URL |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 更新時間 |

---

### ShowHost (節目-主持人關聯)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| show_id | UUID | PK, FK → shows.id | 節目 ID |
| host_id | UUID | PK, FK → hosts.id | 主持人 ID |
| role | TEXT | default 'host' | 角色 (host/co-host/guest) |

---

### Episode (單集節目)

單一集節目內容，由 n8n 工作流寫入 AI 生成內容。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| show_id | UUID | NOT NULL, FK → shows.id | 所屬節目系列 |
| title | TEXT | NOT NULL | 單集標題 |
| slug | TEXT | NOT NULL | URL 友善名稱 |
| published_at | DATE | | 原始發布日期 |
| original_url | TEXT | NOT NULL | 原始節目連結 |
| ai_summary | TEXT | | AI 生成大綱 (由 n8n 寫入) |
| ai_sponsorship | TEXT | | AI 解析業配內容 (由 n8n 寫入) |
| host_notes | TEXT | | 站長心得 |
| duration_seconds | INTEGER | | 節目時長（秒） |
| is_published | BOOLEAN | NOT NULL, default false | 是否公開顯示 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 更新時間 |

**Constraints**:
- UNIQUE (show_id, slug)

**Indexes**:
- `idx_episodes_show_id` on (show_id)
- `idx_episodes_published_at` on (published_at DESC)
- `idx_episodes_is_published` on (is_published) WHERE is_published = true
- `idx_episodes_fts` GIN on (to_tsvector('chinese', title || ' ' || coalesce(ai_summary, '') || ' ' || coalesce(host_notes, '')))

---

### Tag (標籤)

內容分類標籤。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| name | TEXT | NOT NULL, UNIQUE | 標籤名稱 |
| slug | TEXT | NOT NULL, UNIQUE | URL 友善名稱 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |

---

### EpisodeTag (單集-標籤關聯)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| episode_id | UUID | PK, FK → episodes.id | 單集 ID |
| tag_id | UUID | PK, FK → tags.id | 標籤 ID |

---

### Comment (留言)

訪客留言，支援審核機制。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| episode_id | UUID | NOT NULL, FK → episodes.id | 所屬單集 |
| user_id | UUID | NOT NULL, FK → auth.users.id | 留言者 |
| content | TEXT | NOT NULL | 留言內容 |
| status | TEXT | NOT NULL, default 'pending' | 狀態 (pending/approved/hidden/spam) |
| spam_score | REAL | default 0 | 垃圾留言分數 (0-1) |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 更新時間 |

**Validation**:
- status IN ('pending', 'approved', 'hidden', 'spam')
- spam_score BETWEEN 0 AND 1

**Indexes**:
- `idx_comments_episode_id` on (episode_id)
- `idx_comments_user_id` on (user_id)
- `idx_comments_status` on (status)
- `idx_comments_pending` on (status, created_at) WHERE status = 'pending'

**State Transitions**:
```
pending → approved (站長審核通過)
pending → hidden (站長隱藏)
pending → spam (系統/站長標記為垃圾)
approved → hidden (站長事後隱藏)
hidden → approved (站長恢復顯示)
```

---

### AffiliateContent (聯盟行銷內容)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| title | TEXT | NOT NULL | 標題 |
| description | TEXT | | 描述 |
| target_url | TEXT | NOT NULL | 目標連結 |
| image_url | TEXT | | 推廣圖片 |
| is_active | BOOLEAN | NOT NULL, default true | 是否啟用 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 更新時間 |

---

### EpisodeAffiliate (單集-聯盟行銷關聯)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| episode_id | UUID | PK, FK → episodes.id | 單集 ID |
| affiliate_id | UUID | PK, FK → affiliate_contents.id | 聯盟行銷 ID |
| position | INTEGER | default 0 | 顯示順序 |

---

### AffiliateClick (聯盟行銷點擊記錄)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | 主鍵 |
| affiliate_id | UUID | NOT NULL, FK → affiliate_contents.id | 聯盟行銷 ID |
| episode_id | UUID | FK → episodes.id | 來源單集 (可為空) |
| user_id | UUID | FK → auth.users.id | 點擊者 (可為空) |
| clicked_at | TIMESTAMPTZ | NOT NULL, default now() | 點擊時間 |
| user_agent | TEXT | | 瀏覽器 User Agent |
| referer | TEXT | | 來源頁面 |

**Indexes**:
- `idx_affiliate_clicks_affiliate_id` on (affiliate_id)
- `idx_affiliate_clicks_clicked_at` on (clicked_at)

---

## User Profile Extension

Supabase Auth 自動管理 `auth.users` 表，我們建立 `profiles` 表擴展用戶資料：

### Profile (用戶檔案)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users.id | 用戶 ID (與 auth.users 1:1) |
| display_name | TEXT | | 顯示名稱 |
| avatar_url | TEXT | | 頭像 URL |
| is_admin | BOOLEAN | NOT NULL, default false | 是否為站長 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 建立時間 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 更新時間 |

---

## Row Level Security (RLS) Policies

### shows
- SELECT: 所有人可讀
- INSERT/UPDATE/DELETE: 僅站長 (is_admin = true)

### episodes
- SELECT: is_published = true 或站長
- INSERT/UPDATE/DELETE: 僅站長

### comments
- SELECT: status = 'approved' 或留言者本人或站長
- INSERT: 已登入用戶
- UPDATE: 留言者本人（僅限 content）或站長
- DELETE: 僅站長

### profiles
- SELECT: 所有人可讀 display_name, avatar_url；完整資料僅本人或站長
- UPDATE: 僅本人或站長

### affiliate_contents, affiliate_clicks
- SELECT: 所有人可讀 affiliate_contents；clicks 僅站長
- INSERT/UPDATE/DELETE: 僅站長

---

## Database Functions

### search_episodes(query TEXT, show_id UUID?, tags UUID[], from_date DATE?, to_date DATE?)

全文搜尋函數，回傳符合條件的 episodes。

```sql
CREATE OR REPLACE FUNCTION search_episodes(
  query TEXT,
  filter_show_id UUID DEFAULT NULL,
  filter_tags UUID[] DEFAULT '{}',
  from_date DATE DEFAULT NULL,
  to_date DATE DEFAULT NULL
)
RETURNS SETOF episodes AS $$
  -- Implementation details in migration
$$ LANGUAGE sql STABLE;
```

### check_spam(content TEXT)

檢查留言是否為垃圾內容，回傳 spam_score。

```sql
CREATE OR REPLACE FUNCTION check_spam(content TEXT)
RETURNS REAL AS $$
  -- Implementation: 規則式檢查
  -- 1. 連結數量
  -- 2. 禁用詞比對
  -- 3. 內容長度
$$ LANGUAGE plpgsql STABLE;
```

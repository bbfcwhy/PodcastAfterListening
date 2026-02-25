# 資料模型：Tags 功能完善

**Feature**: 010-tags-complete
**Date**: 2026-02-25

## 現有實體（無需變更）

### tags

已存在於 migrations/001。

| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 主鍵 |
| name | TEXT | NOT NULL, UNIQUE | 標籤名稱 |
| slug | TEXT | NOT NULL, UNIQUE | URL-safe 識別碼 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 建立時間 |

### episode_tags

已存在於 migrations/001。

| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| episode_id | UUID | FK → podcast_episodes(id) ON DELETE CASCADE | 單集 ID |
| tag_id | UUID | FK → tags(id) ON DELETE CASCADE | 標籤 ID |
| | | PK (episode_id, tag_id) | 複合主鍵 |

## 新增實體

### show_tags

取代 shows.tags[] 非正規化欄位。

| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| show_id | UUID | FK → shows(id) ON DELETE CASCADE, NOT NULL | 節目 ID |
| tag_id | UUID | FK → tags(id) ON DELETE CASCADE, NOT NULL | 標籤 ID |
| | | PK (show_id, tag_id) | 複合主鍵 |

**RLS Policies**:
- SELECT: 所有人可讀 (`true`)
- INSERT: 僅管理員 (`EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)`)
- DELETE: 僅管理員（同上）

## 欄位移除

### shows.tags（待移除）

- **欄位**: `tags TEXT[]`
- **來源**: migrations/007_schema_refinement_final.sql
- **處理**: 遷移完成後執行 `ALTER TABLE shows DROP COLUMN tags`
- **遷移策略**:
  1. 從 shows.tags[] 提取所有唯一標籤名稱
  2. 在 tags 表中 INSERT（若名稱已存在則取用現有 ID）
  3. 建立 show_tags 關聯
  4. 驗證遷移正確性
  5. 移除 shows.tags 欄位

## 關聯圖

```
tags (1) ─── (*) episode_tags (*) ─── (1) podcast_episodes
  │
  └── (*) show_tags (*) ─── (1) shows
```

## 驗證規則

| 規則 | 說明 |
|------|------|
| 標籤名稱唯一 | tags.name UNIQUE 約束 |
| 標籤 slug 唯一 | tags.slug UNIQUE 約束 |
| 單集標籤上限 10 | 應用層驗證（INSERT 前 COUNT 檢查） |
| Slug 格式 | URL-safe 字元，允許中文 URL-encoded |
| CASCADE 刪除 | 刪除 tag → 移除所有 episode_tags 和 show_tags 關聯 |

## TypeScript 型別更新

```typescript
// 新增至 src/types/database.ts
show_tags: {
  Row: {
    show_id: string;
    tag_id: string;
  };
  Insert: {
    show_id: string;
    tag_id: string;
  };
  Update: {
    show_id?: string;
    tag_id?: string;
  };
};

// 移除 shows.tags 欄位（Row、Insert、Update 三處）
```

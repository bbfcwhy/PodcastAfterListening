# 快速上手：Tags 功能完善

**Feature**: 010-tags-complete
**Date**: 2026-02-25

## 前置條件

- Node.js 18+, npm
- Supabase 專案已設定（含 service role key）
- 本地 `.env.local` 設定完成

## 開發步驟概覽

### 1. 資料庫遷移

```sql
-- 建立 show_tags 關聯表
CREATE TABLE show_tags (
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (show_id, tag_id)
);

-- RLS
ALTER TABLE show_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "show_tags_select_all" ON show_tags FOR SELECT USING (true);
CREATE POLICY "show_tags_insert_admin" ON show_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "show_tags_delete_admin" ON show_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 遷移 shows.tags[] 至 show_tags
-- (一次性遷移腳本，見 tasks)
```

### 2. 新增檔案

```text
src/
├── app/
│   ├── (admin)/tags/
│   │   ├── page.tsx                    # 標籤管理列表頁
│   │   ├── new/page.tsx                # 新增標籤頁
│   │   └── [id]/edit/page.tsx          # 編輯標籤頁
│   ├── (public)/tags/
│   │   └── [slug]/page.tsx             # 標籤瀏覽頁面
│   └── api/admin/
│       ├── tags/
│       │   ├── route.ts                # GET（列表）/ POST（建立）
│       │   └── [id]/
│       │       ├── route.ts            # PATCH / DELETE
│       │       └── usage/route.ts      # GET（使用統計）
│       ├── episodes/[id]/tags/route.ts # PUT（設定單集標籤）
│       └── shows/[id]/tags/route.ts    # PUT（設定節目標籤）
├── components/admin/
│   └── TagPicker.tsx                   # 標籤搜尋選擇器（共用）
└── lib/tags/
    └── actions.ts                      # Server actions
```

### 3. 修改檔案

```text
src/components/admin/AdminSidebar.tsx    # 新增「標籤管理」入口
src/components/admin/EpisodeForm.tsx     # 新增 TagPicker
src/components/admin/ShowForm.tsx        # 替換 tags input 為 TagPicker
src/components/search/SearchFilters.tsx  # 啟用 tags 篩選 UI
src/app/(public)/episodes/.../page.tsx   # 標籤改為可點擊 Link
src/types/database.ts                   # 新增 show_tags 型別，移除 shows.tags
```

### 4. 驗證

```bash
# 本地開發
npm run dev

# 驗證項目
# 1. /admin/tags → 建立/編輯/刪除標籤
# 2. /admin/episodes/edit/[id] → 指派標籤
# 3. /episodes/[show]/[ep] → 點擊標籤跳轉
# 4. /tags/[slug] → 顯示該標籤的單集列表
# 5. /search → 使用標籤篩選
```

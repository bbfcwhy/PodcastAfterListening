# Research: Library 頁面「我的留言」Tab

**Feature Branch**: `009-library-commented-tab`
**Date**: 2026-02-25

## 研究項目

### 1. 如何查詢使用者留言過的單集（含去重、計數、排序）

**Decision**: 在 Server Component 中查詢 `comments` 表，在應用程式層進行分組與計數

**Rationale**:
- Supabase PostgREST 不直接支援 GROUP BY + aggregate
- 建立 RPC 函式雖然效能最佳，但對此功能範圍而言過於複雜
- 使用者留言過的單集數量通常不多（< 100），應用層分組效能足夠

**Alternatives considered**:
- RPC 函式（效能最佳但需額外維護資料庫函式）
- 在前端分組（增加傳輸量且需要 client component）

**查詢方案**:
1. 查詢 `comments` 表，篩選 `user_id` 和 `status = approved`
2. 在應用層按 `episode_id` 分組，計算每個單集的留言數和最新留言時間
3. 用分組後的 `episode_id` 列表查詢 `episodes` VIEW（含 shows join）
4. 合併資料後按最新留言時間倒序排列

### 2. episodes VIEW 與 comments 的關聯方式

**Decision**: `comments.episode_id` 儲存的是 `podcast_episodes.id`（UUID），`episodes` VIEW 也使用相同的 `id`，因此可以透過 VIEW 正常查詢

**Rationale**: 既有的 `getCommentsByEpisode()` 和 `getCommentCount()` 函式都透過 `episode_id` 直接查詢，運作正常

### 3. 新元件設計模式

**Decision**: 建立 `CommentedEpisodeList.tsx`，複用 `EpisodeLibraryList.tsx` 的設計模式，額外顯示留言數量

**Rationale**: 與既有的 Library 列表元件保持一致的 UI 風格和程式碼模式

### 4. Library 頁面 Tabs 擴展

**Decision**: 將 `TabsList` 的 `grid-cols-2` 改為 `grid-cols-3`，新增「我的留言」Tab

**Rationale**: 直接擴展既有的 Tabs 結構，最小化變更範圍

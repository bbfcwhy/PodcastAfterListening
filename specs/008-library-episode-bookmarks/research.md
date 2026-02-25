# Research: Library 收藏功能修復與單集收藏

**Feature Branch**: `008-library-episode-bookmarks`
**Date**: 2026-02-25

## Bug 根因分析：Library 頁面不顯示已收藏頻道

### 主要原因：Next.js Client-Side Router Cache

**Decision**: Library 頁面的快取策略導致使用者看到過期資料

**Rationale**:
使用者在 `/shows/[slug]` 頁面按下收藏後，Server Action `addToLibrary()` 確實正確寫入資料庫並呼叫 `revalidatePath("/library")`。但 Next.js 的 **Client-Side Router Cache** 會快取先前造訪過的路由。當使用者透過 `<Link>` 導航回 `/library` 時，Router Cache 提供了快取的（空的）版本，而非重新從伺服器取得最新資料。

**Alternatives considered**:
- RLS 政策問題 → 排除：`library_items` 和 `shows` 表的 RLS 政策正確
- Supabase Auth/Cookie 問題 → 排除：`createClient()` 使用標準 `@supabase/ssr` 模式
- Insert 操作失敗 → 排除：`addToLibrary` 正確處理插入和重複約束
- Middleware 攔截 → 排除：middleware 對 `/library` 路由僅做 cookie refresh

### 次要原因 1：LibraryList 元件的 stale props

**Decision**: `LibraryList` 使用 `useState(initialItems)` 導致 props 更新不會反映到 UI

**Rationale**:
`useState(initialValue)` 只在首次掛載時使用初始值。即使父元件重新渲染並傳入新的 `initialItems`，`LibraryList` 的內部狀態不會更新。需要透過 `key` prop 強制 remount 或使用 `useEffect` 同步。

### 次要原因 2：revalidatePath 路徑錯誤

**Decision**: `revalidatePath("/shows/${showId}")` 使用 UUID 而非 slug

**Rationale**:
Show 頁面路由為 `/shows/[slug]`（slug 為人類可讀字串），但 `revalidatePath` 傳入的是 UUID。路徑永遠不會匹配實際的 show 頁面，因此 show 頁面的伺服器端快取不會被清除。但因為 `AddToLibraryButton` 使用客戶端 `useState` 做樂觀更新，此問題對使用者體驗影響較小。

---

## 修復策略

### 策略 1：Library 頁面強制動態渲染

**Decision**: 在 Library 頁面加入 `export const dynamic = "force-dynamic"`

**Rationale**: Library 是每個使用者獨立的頁面，依賴認證狀態，不應該被靜態快取。強制動態渲染確保每次請求都從伺服器取得最新資料。

### 策略 2：AddToLibraryButton 觸發 router.refresh()

**Decision**: 在收藏/取消收藏操作完成後呼叫 `router.refresh()` 清除 Client-Side Router Cache

**Rationale**: 這是 Next.js 官方推薦的方式來強制客戶端更新伺服器元件的資料。配合 `revalidatePath` 使用，可以確保使用者導航到 Library 頁面時看到最新資料。

---

## 單集收藏：技術方案

### 資料儲存

**Decision**: 新增獨立的 `episode_library_items` 表

**Rationale**: 與 `library_items`（頻道收藏）分開管理，避免在同一表中用 nullable 欄位區分類型。兩者的行為不同（頻道有排序、單集沒有），分開管理更清晰。

**Alternatives considered**:
- 在 `library_items` 新增 `episode_id` nullable 欄位 → 拒絕：混合不同語義的資料，查詢複雜度增加
- 建立通用的 `bookmarks` 表（polymorphic） → 拒絕：過度設計，且 RLS 政策會更複雜

### UI 元件

**Decision**: 複用 `AddToLibraryButton` 的設計模式，建立 `AddEpisodeToLibraryButton` 元件

**Rationale**: 維持一致的 UI 風格和使用者體驗，同時保持元件職責單一。

### Library 頁面分類

**Decision**: 使用 shadcn/ui 的 `Tabs` 元件做分頁切換

**Rationale**: 專案已使用 `@radix-ui/react-tabs`（shadcn/ui 的 Tabs 底層），無需新增依賴。Tab 是最直覺的分類切換 UI 模式。

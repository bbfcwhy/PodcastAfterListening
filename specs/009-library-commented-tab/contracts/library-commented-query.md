# Query Contract: 我的留言單集列表

**Feature Branch**: `009-library-commented-tab`

## 概述

本功能不新增 API Route 或 Server Action，僅在 Library 頁面的 Server Component 中新增查詢邏輯。

---

### 「我的留言」單集列表查詢

**觸發**: 使用者進入 Library 頁面時，Server Component 自動執行

**查詢 1 — 取得使用者的 approved 留言**:

```
FROM comments
SELECT episode_id, created_at
WHERE user_id = {current_user_id}
  AND status = 'approved'
ORDER BY created_at DESC
```

**應用層處理**:
1. 按 `episode_id` 分組
2. 計算每個單集的留言數量
3. 取得每個單集的最新留言時間

**查詢 2 — 取得單集詳情**:

```
FROM episodes (VIEW)
SELECT *, show:shows(name, slug, cover_image_url)
WHERE id IN ({grouped_episode_ids})
```

**最終輸出**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| episode | Episode & { show } | 單集資訊（含頻道） |
| commentCount | number | 使用者在該單集的 approved 留言數量 |
| latestCommentAt | string | 最新留言時間（ISO 8601） |

**排序**: 按 `latestCommentAt` 倒序

**空狀態**: 當使用者沒有任何 approved 留言時，回傳空陣列

**錯誤處理**: 查詢失敗時 log 錯誤，回傳空陣列（頁面仍可正常顯示其他 Tab）

# API Contracts: 單集收藏 Server Actions

**Feature Branch**: `008-library-episode-bookmarks`

## Server Actions（Next.js Server Actions）

本 feature 主要使用 Next.js Server Actions（與現有頻道收藏模式一致），不新增 API Route。

---

### addEpisodeToLibrary

**觸發**: 使用者在單集詳情頁點擊「收藏」按鈕

**輸入**:
| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| episodeId | string (UUID) | 是 | 要收藏的單集 ID |

**行為**:
1. 驗證使用者已登入（從 cookie 取得 session）
2. 插入 `episode_library_items` 記錄
3. 處理重複約束錯誤（PostgreSQL error code 23505）→ 靜默忽略
4. 呼叫 `revalidatePath("/library")` 清除伺服器快取

**輸出**: 無回傳值（void）

**錯誤**:
| 情境 | 處理方式 |
|------|----------|
| 未登入 | throw Error("未登入") |
| 重複收藏 | 靜默忽略（已收藏視為成功） |
| 資料庫錯誤 | throw Error(error.message) |

---

### removeEpisodeFromLibrary

**觸發**: 使用者在單集詳情頁或 Library 頁面點擊「取消收藏」按鈕

**輸入**:
| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| episodeId | string (UUID) | 是 | 要取消收藏的單集 ID |

**行為**:
1. 驗證使用者已登入
2. 刪除匹配 `user_id` + `episode_id` 的 `episode_library_items` 記錄
3. 呼叫 `revalidatePath("/library")` 清除伺服器快取

**輸出**: 無回傳值（void）

**錯誤**:
| 情境 | 處理方式 |
|------|----------|
| 未登入 | throw Error("未登入") |
| 記錄不存在 | 靜默忽略（已不在收藏中視為成功） |
| 資料庫錯誤 | throw Error(error.message) |

---

## 既有 Server Actions 修正

### addToLibrary（既有，需修正）

**變更**:
- 修正 `revalidatePath` 路徑（移除錯誤的 show UUID 路徑）

### removeFromLibrary（既有，需修正）

**變更**:
- 同上

---

## Library 頁面查詢 Contract

### 頻道收藏查詢（既有，不變）

```
FROM library_items
SELECT *, show:shows(*)
WHERE user_id = current_user
ORDER BY position ASC, added_at DESC
FILTER: show IS NOT NULL（過濾已刪除頻道）
```

### 單集收藏查詢（新增）

```
FROM episode_library_items
SELECT *, episode:episodes(*, show:shows(name, slug, cover_image_url))
WHERE user_id = current_user
ORDER BY added_at DESC
FILTER: episode IS NOT NULL（過濾已刪除單集）
```

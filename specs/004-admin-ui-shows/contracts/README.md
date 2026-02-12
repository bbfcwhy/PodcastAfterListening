# API Contracts: 節目管理

**Feature**: 004-admin-ui-shows
**Date**: 2026-01-30

## Shows API

Base path: `/api/admin/shows`

---

### GET /api/admin/shows

取得節目列表（支援分頁）

**Query Parameters**:
| 參數 | 類型 | 說明 |
|------|------|------|
| page | number | 頁碼，預設 1 |
| pageSize | number | 每頁筆數，預設 20 |

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "節目名稱",
      "slug": "show-slug",
      "description": "描述",
      "cover_image_url": "https://...",
      "original_url": "https://...",
      "created_at": "2026-01-30T12:00:00Z",
      "updated_at": "2026-01-30T12:00:00Z"
    }
  ],
  "total": 42
}
```

---

### POST /api/admin/shows

建立新節目

**Request Body**:
```json
{
  "name": "節目名稱",
  "slug": "show-slug",
  "description": "描述（選填）",
  "cover_image_url": "https://...（選填）",
  "original_url": "https://...（選填）"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "節目名稱",
  "slug": "show-slug",
  ...
}
```

**Error** (400):
```json
{
  "error": "驗證失敗訊息",
  "field": "slug"
}
```

**Error** (409):
```json
{
  "error": "slug 已被使用"
}
```

---

### GET /api/admin/shows/[id]

取得單一節目

**Response** (200):
```json
{
  "id": "uuid",
  "name": "節目名稱",
  ...
}
```

**Error** (404):
```json
{
  "error": "節目不存在"
}
```

---

### PATCH /api/admin/shows/[id]

更新節目

**Request Body**:
```json
{
  "name": "新名稱",
  "slug": "new-slug",
  "description": "新描述",
  "cover_image_url": "https://...",
  "original_url": "https://...",
  "updated_at": "2026-01-30T12:00:00Z"
}
```

**Note**: `updated_at` 用於樂觀鎖。若提供且與資料庫不符，回傳 409。

**Response** (200):
```json
{
  "id": "uuid",
  "name": "新名稱",
  ...
}
```

**Error** (409):
```json
{
  "error": "此筆內容已有更新版本",
  "current_updated_at": "2026-01-30T13:00:00Z"
}
```

---

### DELETE /api/admin/shows/[id]

刪除節目（本規格不實作，保留 endpoint 定義供日後擴充）

**Response** (501):
```json
{
  "error": "刪除功能尚未開放"
}
```

# API Contract：標籤管理

**Feature**: 010-tags-complete
**Date**: 2026-02-25

## Admin API Routes

### GET /api/admin/tags

列出所有標籤（含使用統計）。

**Auth**: 管理員

**Response 200**:
```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "科技",
      "slug": "科技",
      "created_at": "2026-02-25T00:00:00Z",
      "episode_count": 5,
      "show_count": 2
    }
  ]
}
```

### POST /api/admin/tags

建立新標籤。

**Auth**: 管理員

**Request Body**:
```json
{
  "name": "科技",
  "slug": "科技"
}
```

**Response 201**:
```json
{
  "tag": { "id": "uuid", "name": "科技", "slug": "科技", "created_at": "..." }
}
```

**Error 400**: `{ "error": "標籤名稱為必填", "field": "name" }`
**Error 409**: `{ "error": "此標籤已存在", "field": "name" }`

### PATCH /api/admin/tags/[id]

更新標籤。

**Auth**: 管理員

**Request Body**:
```json
{
  "name": "科技新聞",
  "slug": "科技新聞"
}
```

**Response 200**: 更新後的 tag 物件
**Error 400**: 驗證錯誤
**Error 404**: 標籤不存在
**Error 409**: 名稱或 slug 已被使用

### DELETE /api/admin/tags/[id]

刪除標籤。

**Auth**: 管理員

**Response 200**:
```json
{ "success": true }
```

**Error 404**: 標籤不存在

### GET /api/admin/tags/[id]/usage

查詢標籤使用統計（用於刪除確認對話框）。

**Auth**: 管理員

**Response 200**:
```json
{
  "episode_count": 5,
  "show_count": 2
}
```

## Episode Tags 管理

### PUT /api/admin/episodes/[id]/tags

設定單集的標籤（全量替換）。

**Auth**: 管理員

**Request Body**:
```json
{
  "tag_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Validation**: tag_ids.length <= 10

**Response 200**:
```json
{ "success": true }
```

**Error 400**: `{ "error": "標籤數量不能超過 10 個" }`

## Show Tags 管理

### PUT /api/admin/shows/[id]/tags

設定節目的標籤（全量替換）。

**Auth**: 管理員

**Request Body**:
```json
{
  "tag_ids": ["uuid1", "uuid2"]
}
```

**Response 200**:
```json
{ "success": true }
```

## Public Routes

### GET /tags/[slug] (Page Route)

標籤瀏覽頁面（Next.js Page，非 API）。

**Auth**: 公開

**行為**: Server Component 查詢 tag + 關聯的已發布單集，渲染 card grid。

## Service Functions

### Server Actions (src/lib/tags/actions.ts)

```typescript
getAllTags(): Promise<Tag[]>
getTagBySlug(slug: string): Promise<Tag | null>
getEpisodesByTag(tagId: string): Promise<Episode[]>
getTagUsageCount(tagId: string): Promise<{ episode_count: number; show_count: number }>
```

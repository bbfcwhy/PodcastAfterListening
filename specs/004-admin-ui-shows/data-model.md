# Data Model: 後台 UI 風格統一與節目管理

**Feature**: 004-admin-ui-shows
**Date**: 2026-01-30

## 實體定義

### Show（節目）

代表一個 Podcast 節目系列，是 Episode 的父層級。

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | uuid | PK | 自動產生 |
| name | varchar(255) | 是 | 節目名稱 |
| slug | varchar(255) | 是 | URL 識別碼，唯一 |
| description | text | 否 | 節目描述 |
| cover_image_url | text | 否 | 封面圖片 URL |
| original_url | text | 否 | 原始連結（如 Spotify、Apple Podcast） |
| created_at | timestamptz | 是 | 建立時間，預設 now() |
| updated_at | timestamptz | 是 | 更新時間，預設 now() |

**關聯**：
- Show 1:N Episode（透過 episode.show_id）
- Show N:M Host（透過 show_hosts 關聯表）

**驗證規則**：
- name: 必填，1-255 字元
- slug: 必填，唯一，僅允許 `[a-z0-9-]`，1-255 字元
- description: 最大 2000 字元
- cover_image_url: 須為有效 URL 格式
- original_url: 須為有效 URL 格式

**狀態變更**：
- 無特殊狀態欄位
- updated_at 用於樂觀鎖（衝突偵測）

---

## 設計 Tokens（既有）

本 feature 不新增設計 tokens，使用 `globals.css` 已定義的變數：

| Token | 用途 | 色碼 |
|-------|------|------|
| canvas | 全站底色 | #E4CBAC |
| surface | 卡片/容器底色 | #FFFFFF |
| text-primary | 主文字 | #664129 |
| text-secondary | 次要文字 | #B0967B |
| cta | CTA 按鈕 | #DAA551 |
| hover | 滑過狀態 | rgba(138,158,158,0.12) |
| border-subtle | 淡邊框 | rgba(138,158,158,0.35) |

---

## TypeScript 型別

```typescript
// 既有於 src/types/database.ts
export type Show = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  original_url: string | null;
  created_at: string;
  updated_at: string;
};
```

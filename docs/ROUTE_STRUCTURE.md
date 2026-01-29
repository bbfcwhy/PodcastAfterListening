# 路由結構說明

## 當前路由結構

### 公開路由 (public)

```
/episodes/[showSlug]/[episodeSlug]  - 單集詳情頁
/shows/[slug]                       - 節目系列頁
/search                              - 搜尋頁
/                                    - 首頁
```

### 管理後台路由 (admin)

```
/admin/dashboard                     - 儀表板
/admin/episodes                      - 節目列表
/admin/episodes/new                  - 新增節目
/admin/episodes/edit/[id]            - 編輯節目（已修復路由衝突）
/admin/comments                      - 留言審核
/admin/affiliates                    - 聯盟行銷列表
/admin/affiliates/new                - 新增聯盟行銷
/admin/affiliates/[id]/edit          - 編輯聯盟行銷
```

### API 路由

```
/api/comments/[episodeId]            - 留言 API
/api/search                          - 搜尋 API
/api/affiliate/redirect/[affiliateId] - 聯盟行銷重導向
/api/admin/episodes/[id]            - 管理後台節目 API
/api/admin/comments/[id]             - 管理後台留言 API
/api/admin/affiliates                - 管理後台聯盟行銷 API
/api/admin/affiliates/[id]           - 管理後台聯盟行銷 API
```

## 路由衝突修復

### 問題

Next.js 16 不允許在同一個路徑層級使用不同的動態參數名稱。

**衝突的路由**：
- `(public)/episodes/[showSlug]/[episodeSlug]`
- `(admin)/episodes/[id]/edit` ❌

### 解決方案

將管理後台的編輯路由改為：
- `(admin)/episodes/edit/[id]` ✅

這樣就不會與公開路由衝突了。

## 路由命名規則

為了避免未來出現類似問題，遵循以下規則：

1. **公開路由**：使用語義化的 slug（如 `showSlug`, `episodeSlug`）
2. **管理後台路由**：使用 `edit/[id]` 或 `new` 作為固定路徑，避免在動態參數層級衝突
3. **API 路由**：使用資源名稱 + `[id]` 的結構

## 注意事項

- `affiliates/[id]/edit` 不會與 `episodes` 衝突，因為它們在不同的路徑下
- 所有路由都應該在各自的路由組內保持一致性

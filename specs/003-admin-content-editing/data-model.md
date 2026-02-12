# Data Model (本 feature 相關)

**Feature**: 003-admin-content-editing  
**Date**: 2026-01-29

本 feature 不新增表；沿用既有 Supabase schema。以下為與「後台輕鬆修改」直接相關的實體與欄位，供列表、編輯、衝突偵測與分頁使用。

---

## 既有實體摘要

### 站長 (profiles)

- **id** (uuid, PK)：對應 Supabase Auth user id  
- **is_admin** (boolean)：是否為後台站長；proxy 與 API 以此判斷是否允許存取 admin  
- **display_name**, **avatar_url**, **created_at**, **updated_at**

### 節目 (shows)

- **id**, **name**, **slug**, **description**, **cover_image_url**, **original_url**, **created_at**, **updated_at**  
- 本 feature：單集編輯時所屬節目為必填（show_id）；若節目被刪除，編輯介面須顯示「所屬節目已刪除」並引導處理（spec Edge Cases）。

### 單集 (episodes)

- **id**, **show_id**, **title**, **slug**, **published_at**, **original_url**, **ai_summary**, **ai_sponsorship**, **host_notes**, **duration_seconds**, **is_published**, **created_at**, **updated_at**  
- **is_published**：上架狀態；列表須顯示並可一鍵切換。  
- **updated_at**：用於 n8n 並行更新偵測；站長儲存前比對「目前 DB 的 updated_at」與「進入編輯頁時的 updated_at」，若 DB 較新則提示有更新版本。

### 留言 (comments)

- **id**, **episode_id**, **user_id**, **content**, **status**, **spam_score**, **created_at**, **updated_at**  
- **status**：`pending` | `approved` | `hidden` | `spam`；列表須可依狀態篩選，單筆可執行通過／隱藏／標記垃圾。

### 聯盟內容 (affiliate_contents)

- **id**, **title**, **description**, **target_url**, **image_url**, **is_active**, **created_at**, **updated_at**  
- **updated_at**：若未來聯盟內容也由外部更新，可同樣用於衝突偵測。

---

## 驗證與約束（來自 spec）

- **必填**：編輯表單上必填欄位（如單集 title、show_id）送出時驗證，未通過則阻止儲存並顯示錯誤。  
- **長文**：大綱、心得等長文欄位須有長度上限或在表單標示，避免儲存時才失敗（spec Edge Cases）。  
- **父資源刪除**：單集所屬節目若被刪除，編輯介面須顯示明確狀態並引導站長選擇其他節目或處理方式。

---

## 狀態與生命週期

- **單集／節目上架**：`is_published`；站長在列表可一鍵切換，儲存後前台依此顯示與否。  
- **留言審核**：`status` 由 pending → approved 或 hidden 或 spam；列表依狀態篩選，單筆操作即更新 status。

---

## 分頁與列表

- 單集、節目（若有獨立節目列表）、留言、聯盟內容列表：後端支援 `page` 與 `pageSize`（預設 20），對應 Supabase `.range()`。  
- 總筆數可由 `count` 或同一查詢取得，供前端分頁 UI 顯示總頁數。

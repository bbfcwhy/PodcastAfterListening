# Feature Specification: 後台 UI 風格統一與節目管理

**Feature Branch**: `004-admin-ui-shows`
**Created**: 2026-01-30
**Status**: Draft
**Input**: User description: "我想要調整後台的UI配色，讓他更好看一點，follow前台的設計方式，然後我還想要一個可以修改節目資訊的頁面"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 後台 UI 配色與前台一致 (Priority: P1)

管理員進入後台時，整體視覺風格與前台一致：使用暖色系背景 (`bg-canvas`)、白色卡片容器 (`bg-surface`)、棕色主文字 (`text-text-primary`)、金色 CTA 按鈕 (`bg-cta`) 等設計 tokens，側邊欄、按鈕、表格、表單等元件皆遵循相同規則。

**Why this priority**: 後台與前台使用相同設計語言，讓管理員有一致的使用體驗，同時降低維護多套樣式的成本。

**Independent Test**: 可透過並排比對後台與前台頁面，確認主色、背景、文字、按鈕等視覺風格一致。

**Acceptance Scenarios**:

1. **Given** 管理員進入後台 `/dashboard`, **When** 頁面載入完成, **Then** 整體背景使用 `bg-canvas`、側邊欄使用 `bg-surface`、主文字使用 `text-text-primary`
2. **Given** 後台頁面有主要操作按鈕, **When** 管理員檢視, **Then** 主按鈕使用 `bg-cta` 搭配深色文字、次要按鈕使用 `border-cta` 描邊樣式
3. **Given** 後台有表格（如單集列表、留言列表）, **When** 管理員檢視, **Then** 表格使用 `bg-surface` 底色、分隔線使用 `border-border-subtle`、hover 使用 `bg-hover`

---

### User Story 2 - 節目列表與管理頁面 (Priority: P2)

管理員可在後台查看所有節目（Shows）列表，包含節目名稱、描述、封面、原始連結等資訊，並可點擊進入編輯單一節目。

**Why this priority**: 節目是單集的父層級，管理節目資訊是完整後台功能的必要一環，但優先於 UI 風格調整完成後再實作。

**Independent Test**: 可透過訪問 `/shows` 頁面，確認能看到節目列表並點擊進入編輯頁面。

**Acceptance Scenarios**:

1. **Given** 管理員進入 `/shows` 頁面, **When** 頁面載入完成, **Then** 顯示所有節目的列表，每筆包含名稱、slug、封面縮圖、建立時間
2. **Given** 節目列表顯示中, **When** 管理員點擊某節目的「編輯」按鈕, **Then** 導向 `/shows/{id}/edit` 編輯頁面
3. **Given** 節目列表超過單頁數量, **When** 管理員檢視, **Then** 顯示分頁元件並可切換頁面

---

### User Story 3 - 編輯節目資訊 (Priority: P2)

管理員可編輯單一節目的所有欄位：名稱、slug、描述、封面圖片 URL、原始連結，並儲存變更。

**Why this priority**: 與 User Story 2 同等重要，提供 CRUD 中的 Update 功能。

**Independent Test**: 可透過訪問 `/shows/{id}/edit` 頁面，修改欄位並儲存，確認資料庫已更新。

**Acceptance Scenarios**:

1. **Given** 管理員進入 `/shows/{id}/edit` 頁面, **When** 頁面載入完成, **Then** 表單預填目前節目資料（名稱、slug、描述、封面 URL、原始連結）
2. **Given** 管理員修改節目名稱, **When** 點擊「更新」按鈕, **Then** 資料庫更新成功並顯示成功訊息
3. **Given** 管理員修改 slug 為已存在的值, **When** 點擊「更新」按鈕, **Then** 顯示錯誤訊息「slug 已被使用」

---

### User Story 4 - 新增節目 (Priority: P3)

管理員可新增節目，填寫名稱、slug、描述、封面圖片 URL、原始連結後建立。

**Why this priority**: 完整 CRUD 功能的一環，但使用頻率較低。

**Independent Test**: 可透過訪問 `/shows/new` 頁面，填寫表單並送出，確認節目已建立。

**Acceptance Scenarios**:

1. **Given** 管理員進入 `/shows/new` 頁面, **When** 頁面載入完成, **Then** 顯示空白表單
2. **Given** 管理員填寫必填欄位（名稱、slug）, **When** 點擊「建立」按鈕, **Then** 節目建立成功並導向節目列表頁

---

### User Story 5 - 側邊欄新增節目管理連結 (Priority: P1)

後台側邊欄新增「節目管理」連結，點擊可進入節目列表頁面。

**Why this priority**: 這是進入節目管理功能的入口，必須與 UI 風格調整一起完成。

**Independent Test**: 可透過點擊側邊欄的「節目管理」連結，確認導向 `/shows` 頁面。

**Acceptance Scenarios**:

1. **Given** 管理員在後台任一頁面, **When** 檢視側邊欄, **Then** 看到「節目管理」連結與對應圖示
2. **Given** 管理員點擊「節目管理」連結, **When** 導航完成, **Then** 顯示節目列表頁面

---

### Edge Cases

- 若節目已有關聯的單集，刪除節目時應提示或禁止（本規格不包含刪除功能，待日後擴充）。
- 若封面圖片 URL 無效或無法載入，列表頁應顯示預設佔位圖。
- 編輯時發生衝突（其他管理員同時修改），應顯示衝突提示並提供重新載入或覆蓋選項（延續既有 EpisodeForm 的衝突處理機制）。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 後台所有頁面的背景、文字、按鈕、邊框等樣式必須使用與前台相同的設計 tokens（canvas、surface、text-primary、cta 等）。
- **FR-002**: 後台側邊欄必須使用 `bg-surface`，導覽項目 hover 使用 `bg-hover`，選中狀態使用 `bg-selected`。
- **FR-003**: 後台表格必須使用 `bg-surface` 底色、`border-border-subtle` 分隔線、行 hover 使用 `bg-hover`。
- **FR-004**: 系統必須提供 `/shows` 頁面顯示所有節目列表，支援分頁。
- **FR-005**: 系統必須提供 `/shows/{id}/edit` 頁面編輯單一節目資訊。
- **FR-006**: 系統必須提供 `/shows/new` 頁面新增節目。
- **FR-007**: 節目表單必須驗證必填欄位（name、slug），並檢查 slug 唯一性。
- **FR-008**: 節目編輯表單必須實作樂觀鎖機制（檢查 updated_at 避免衝突覆蓋）。
- **FR-009**: 後台側邊欄必須新增「節目管理」連結，使用適當圖示（如 Radio 或 Podcast icon）。

### Key Entities

- **Show（節目）**: 代表一個 Podcast 節目系列，包含 id、name（名稱）、slug（URL 識別碼）、description（描述）、cover_image_url（封面圖片）、original_url（原始連結）、created_at、updated_at。
- **設計 tokens**: 與 002-ui-reference-style 規格一致的語意化顏色變數，定義於 globals.css。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 後台與前台並排比對時，管理員能辨識出相同的主色、背景層級與按鈕風格。
- **SC-002**: 後台所有頁面無硬編色碼（如 `#xxx`）直接寫在元件上，皆透過 Tailwind 設計 token class 引用。
- **SC-003**: 管理員可在 `/shows` 頁面查看所有節目並點擊進入編輯頁面。
- **SC-004**: 管理員可在 `/shows/{id}/edit` 頁面修改節目資訊並成功儲存至資料庫。
- **SC-005**: 管理員可在 `/shows/new` 頁面建立新節目。
- **SC-006**: 後台側邊欄顯示「節目管理」連結且可正常導航。

## Assumptions

- 延續 002-ui-reference-style 已定義的設計 tokens，無需重新定義色彩變數。
- 節目管理功能不包含刪除節目（避免誤刪關聯單集），日後可擴充。
- 節目管理頁面使用與 EpisodeForm、AffiliateForm 相同的表單與衝突處理模式。

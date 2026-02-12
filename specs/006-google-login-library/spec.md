# 功能規格書：Google 登入與 Library 功能

**Feature Branch**: `006-google-login-library`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Google 帳號登入 (特定帳號為管理員) 以及讓使用者收藏 Podcast 的 Library 功能。"

## 使用者情境與測試 (User Scenarios & Testing)

### User Story 1 - Google 登入 (優先級: P1)

作為一名使用者，我想要使用我的 Google 帳號登入，這樣我就不需要另外建立一組帳號密碼，並且可以存取個人化功能。

**優先級原因**: 身份驗證是 Library 和 Admin 功能的基礎。

**獨立測試**: 點擊「使用 Google 登入」，驗證使用者狀態是否變更為已登入。

**驗收情境 (Acceptance Scenarios)**:

1. **Given** 首頁上的訪客使用者，**When** 他們點擊「使用 Google 登入」，**Then** 他們會被導向 Google 的 OAuth 授權畫面。
2. **Given** 使用者在 Google 上核准權限，**When** 他們被導回網站，**Then** 他們已登入，且若無帳號則自動建立使用者資料。
3. **Given** 一名未登入的使用者，**When** 他們嘗試存取受保護的路徑 (例如 /library)，**Then** 他們會被導向登入頁面。

---

### User Story 2 - 管理員存取權限 (優先級: P1)

作為網站擁有者，我希望我特定的 Google 帳號擁有管理員權限，以便我能管理網站內容。

**優先級原因**: 對於網站管理與安全性至關重要。

**獨立測試**: 使用指定的管理員 Email 登入並驗證是否可存取 Admin Dashboard。使用非管理員 Email 登入並驗證是否被拒絕存取。

**驗收情境 (Acceptance Scenarios)**:

1. **Given** 指定的管理員 Google 帳號，**When** 使用者登入，**Then** 系統識別其為 Admin 並顯示「Admin Dashboard」連結。
2. **Given** 一般 Google 帳號，**When** 使用者登入，**Then** 他們被識別為一般 User 且**無法**存取 Admin Dashboard。

---

### User Story 3 - 我的收藏庫 (My Library) (優先級: P2)

作為已登入的使用者，我想要將 Podcast 加入我的 Library，這樣我以後可以輕鬆找到並收聽我喜歡的節目。

**優先級原因**: 註冊使用者的核心價值主張。

**獨立測試**: 將節目加入 Library，重新整理頁面或登出再登入，驗證該節目仍保留在 Library 中。

**驗收情境 (Acceptance Scenarios)**:

1. **Given** 已登入使用者正在瀏覽 Podcast 節目頁面，**When** 他們點擊「加入 Library」，**Then** 按鈕狀態變更為「已收藏」，且該節目被加入他們的收藏列表。
2. **Given** 已登入使用者，**When** 他們訪問 "/library" 頁面，**Then** 他們會看到所有已加入的節目列表。
3. **Given** 已登入使用者，**When** 他們在節目上點擊「從 Library 移除」，**Then** 該節目會從他們的收藏列表中移除。

## 需求 (Requirements)

### 功能需求 (Functional Requirements)

- **FR-001**: 系統**必須**支援透過 Google 進行 OAuth 2.0 身份驗證。
- **FR-002**: 系統**必須**在首次成功登入時自動在資料庫中建立使用者記錄 (JIT provisioning)，並同步 Google 帳號的顯示名稱 (Display Name) 與頭像 (Avatar URL)。
- **FR-003**: 系統**必須**根據環境變數 (如 `ADMIN_EMAILS`) 來驗證使用者 Email，以賦予 Admin 角色。
- **FR-004**: 系統**必須**提供僅限已驗證使用者存取的「Library」頁面。
- **FR-005**: 系統**必須**允許已驗證使用者將 Podcast 節目加入其 Library。
- **FR-006**: 系統**必須**允許已驗證使用者將 Podcast 節目從其 Library 移除。
- **FR-007**: 系統**必須**防止同一節目在使用者 Library 中重複出現。
- **FR-008**: 系統**必須**將 Library 資料持久化儲存於資料庫中。
- **FR-009**: 系統**必須**允許使用者在 Library 中自訂節目的排序 (Drag & Drop 或上下移動)。

## Clarifications

### Session 2026-02-12
- Q: 使用者資料同步? → A: 是，同步名稱與頭像。 (FR-002 updated)
- Q: 管理員名單管理? → A: 使用環境變數 (Environment Variables)。 (FR-003 updated)
- Q: 收藏庫排序? → A: 使用者可自訂排序。 (FR-009 added)

### 關鍵實體 (Key Entities)

- **User**:
    - `id` (UUID, Primary Key)
    - `email` (String, Unique)
    - `display_name` (String, nullable)
    - `avatar_url` (String, nullable)
    - `role` (Enum: USER, ADMIN)
    - `created_at` (Timestamp)
- **LibraryItem**:
    - `id` (UUID, Primary Key)
    - `user_id` (Foreign Key to User)
    - `show_id` (Foreign Key to Show)
    - `position` (Integer, for sorting)
    - `added_at` (Timestamp)

## 成功標準 (Success Criteria)

### 可測量成果 (Measurable Outcomes)

- **SC-001**: 使用者能在 3 次點擊內使用其 Google 憑證成功登入。
- **SC-002**: 驗證特定 Admin 帳號可存取 Admin 路徑，而其他帳號無法存取。
- **SC-003**: 使用者能將節目加入 Library，並在頁面重新整理後看到資料保留。

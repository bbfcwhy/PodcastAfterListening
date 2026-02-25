# Feature Specification: Library 頁面「我的留言」Tab

**Feature Branch**: `009-library-commented-tab`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "如果留言過的單集，在library那邊也會多一個自己留言過的tab"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Library 頁面顯示「我的留言」Tab (Priority: P1)

已登入使用者在 Library 頁面可以看到第三個 Tab「我的留言」，點擊後顯示自己曾經留言過的所有單集列表。每個單集顯示標題、所屬頻道名稱、頻道封面圖、發佈日期，以及該使用者在該單集的 approved 留言數量。列表按最近留言時間倒序排列。

**Why this priority**: 這是本功能的核心且唯一的需求。讓使用者能快速回顧自己參與過討論的單集，提升互動感與回訪率。

**Independent Test**: 登入 → 前往任一單集詳情頁留言 → 前往 Library 頁面 → 點擊「我的留言」Tab → 確認該單集出現在列表中，顯示留言數量

**Acceptance Scenarios**:

1. **Given** 已登入使用者在至少一個單集留言過, **When** 進入 Library 頁面並點擊「我的留言」Tab, **Then** 看到所有留言過的單集列表，按最近留言時間倒序排列
2. **Given** 已登入使用者從未留言過任何單集, **When** 進入 Library 頁面並點擊「我的留言」Tab, **Then** 看到空狀態提示「還沒有留言過的單集」並附探索連結
3. **Given** 使用者在同一單集留言了多次, **When** 進入「我的留言」Tab, **Then** 該單集只出現一次，但顯示留言數量（例如「3 則留言」）
4. **Given** 使用者在某單集的留言全部被隱藏或標記為 spam, **When** 進入「我的留言」Tab, **Then** 該單集不出現在列表中（因為沒有 approved 留言）
5. **Given** 未登入使用者, **When** 嘗試進入 Library 頁面, **Then** 被導向首頁（與現有行為一致）

---

### Edge Cases

- 使用者留言過的單集被刪除時，該單集不應出現在「我的留言」列表中
- 使用者的所有留言都被標記為 spam 或 hidden 時，該單集不應出現在列表中
- 點擊列表中的單集應能正確導航到該單集詳情頁
- 大量留言過的使用者（例如 100+ 個不同單集），頁面仍能正常載入

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Library 頁面 MUST 在現有的「頻道」和「單集」Tab 之後顯示第三個 Tab「我的留言」
- **FR-002**: 「我的留言」Tab MUST 顯示使用者曾留言過的單集列表，僅計算狀態為 approved 的留言
- **FR-003**: 列表中每個項目 MUST 顯示：單集標題、所屬頻道名稱、頻道封面圖、發佈日期、使用者在該單集的 approved 留言數量
- **FR-004**: 列表 MUST 按使用者最近一次 approved 留言的時間倒序排列
- **FR-005**: 當使用者沒有任何 approved 留言時，MUST 顯示空狀態提示並提供探索連結
- **FR-006**: 點擊列表項目 MUST 導航到該單集的詳情頁
- **FR-007**: 已被刪除的單集 MUST 不出現在列表中
- **FR-008**: Tab 的視覺風格 MUST 與現有的「頻道」和「單集」Tab 一致

### Key Entities

- **Comment（留言）**: 使用者對單集的留言記錄，包含使用者 ID、單集 ID、留言內容、狀態（pending/approved/hidden/spam）、建立時間
- **Episode（單集）**: Podcast 單集，包含標題、slug、所屬頻道、發佈日期
- **Show（頻道）**: Podcast 頻道，包含名稱、slug、封面圖

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可在 2 次點擊內（進入 Library → 點擊 Tab）看到自己留言過的所有單集
- **SC-002**: 「我的留言」Tab 載入時間與現有的「頻道」和「單集」Tab 一致，使用者無感知延遲
- **SC-003**: 留言數量顯示準確，僅計算 approved 狀態的留言
- **SC-004**: 100% 的已刪除單集不會出現在列表中

## Scope

### In Scope

- Library 頁面新增「我的留言」Tab
- 查詢使用者留言過的單集（去重、計數、排序）
- 單集列表顯示（含頻道資訊和留言數量）
- 空狀態處理

### Out of Scope

- 留言內容預覽（僅顯示留言數量，不顯示留言內容）
- 從 Library 直接刪除或編輯留言
- 留言通知功能
- 留言搜尋或篩選

## Assumptions

- 現有的 Library 頁面已有「頻道」和「單集」兩個 Tab（由 008-library-episode-bookmarks 功能提供）
- 留言系統已存在且有 approved/pending/hidden/spam 四種狀態
- 未登入使用者無法進入 Library 頁面（現有行為）
- 不需要新增資料表，僅需查詢現有的留言資料

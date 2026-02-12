# Feature Specification: 節目／單集 RSS 欄位與逐字稿來源

**Feature Branch**: `005-rss-metadata-transcript`
**Created**: 2026-01-30
**Status**: Draft
**Input**: 使用者描述：「我發現我還需要在這個網站上顯示這些 Podcast 節目自己的節目圖片、節目名稱、主持人、關於、Hosting provided by XXX、Tags，然後每一集也都會有他們自己填的說明，這些東西應該也是可以從 RSS Feed 那邊下載到？我看 Spotify 也會有逐字稿，這個也下載的到嗎？如果可以，我搞不好就可以不用自己轉逐字稿？」

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 前台顯示節目級欄位 (Priority: P1)

訪客進入節目詳情頁或單集頁時，能看到節目自己的圖片、節目名稱、主持人、關於（描述）、Hosting provided by XXX、Tags 等資訊，且這些資料來源為 RSS Feed（可透過既有或新增的同步機制取得）。

**Why this priority**: 節目與單集資訊若來自 RSS，可與來源一致、減少手動維護，並讓網站呈現與各大平台一致的基本資訊。

**Independent Test**: 確認節目頁／單集頁顯示節目圖片、名稱、主持人、關於、Hosting、Tags；比對 RSS 欄位與資料庫／API 回傳是否對應。

**Acceptance Scenarios**:

1. **Given** 節目已從 RSS 同步過欄位, **When** 訪客進入節目詳情頁, **Then** 顯示節目圖片、節目名稱、主持人、關於、Hosting provided by（若有）、Tags
2. **Given** 單集頁載入, **When** 該單集所屬節目有上述欄位, **Then** 節目區塊顯示節目圖片、名稱、主持人、關於、Hosting、Tags
3. **Given** 某欄位在 RSS 中為空或未提供, **When** 頁面渲染, **Then** 該欄位不顯示或顯示預設／佔位，不報錯

---

### User Story 2 - 單集顯示「單集說明」 (Priority: P1)

訪客進入單集詳情頁時，能看到該集的**單集說明**（即 RSS &lt;item&gt;&lt;description&gt;／節目自己填的說明），與 AI 大綱、站長心得等區塊區分顯示。

**Why this priority**: 與 User Story 1 同為「從 RSS 取得並顯示」的核心需求。

**Independent Test**: 確認單集頁有「單集說明」區塊，內容來自 RSS episode description；若無則不顯示或顯示佔位。

**Acceptance Scenarios**:

1. **Given** 單集已從 RSS 同步過 episode description, **When** 訪客進入單集詳情頁, **Then** 顯示「單集說明」區塊，內容為節目填寫的說明文字
2. **Given** 單集無 episode description（RSS 未提供）, **When** 頁面載入, **Then** 「單集說明」區塊不顯示或顯示「本集無單集說明」
3. **Given** 單集說明內容含 HTML 或連結, **When** 顯示時, **Then** 依安全規則渲染（如允許有限 HTML 或僅純文字）

---

### User Story 3 - RSS 同步節目／單集欄位 (Priority: P2)

系統能從節目的 RSS Feed 下載並更新：節目級（圖片、名稱、主持人、關於、Hosting、Tags）與單集級（單集說明、duration 等）欄位，寫入既有 Show / Episode 結構或擴充欄位。

**Why this priority**: 為 User Story 1、2 的資料來源；可為排程任務或後台手動觸發。

**Independent Test**: 提供測試用 RSS URL，執行同步後檢查 DB 或 API 是否寫入對應欄位。

**Acceptance Scenarios**:

1. **Given** 節目已設定 RSS Feed URL, **When** 執行 RSS 同步（排程或手動）, **Then** 節目欄位（圖片、名稱、主持人、關於、Hosting、Tags）與單集欄位（單集說明、duration 等）依 RSS 更新
2. **Given** RSS 中無 itunes:category 或 Hosting 文字, **When** 同步, **Then** 對應欄位為空或預設，不覆寫為錯誤值
3. **Given** 單集在 RSS 有 &lt;description&gt;, **When** 同步, **Then** 該單集之「單集說明」欄位被更新

---

### User Story 4 - 逐字稿來源與策略 (Priority: P3)

釐清 Spotify 逐字稿是否可程式下載；若不可，則維持或規劃「自轉逐字稿」流程，並在規格中記錄決策與替代方案。

**Why this priority**: 使用者希望若 Spotify 可下載逐字稿則不必自轉；需先釐清可行性再決定實作。

**Independent Test**: 依 research 結論撰寫「逐字稿來源」說明；若採用自轉或第三方，可另開 task 實作。

**Acceptance Scenarios**:

1. **Given** 完成 Phase 0 研究, **When** 查閱 research.md, **Then** 記錄「Spotify 逐字稿是否可下載」結論與替代方案（自轉／第三方工具／僅顯示不儲存等）
2. **Given** 若結論為「不可下載」, **Then** 規格中建議維持既有自轉逐字稿流程或標註為後續擴充

---

### Edge Cases

- RSS 欄位為空或格式異常（如非 UTF-8）：同步時應跳過或存成空值，不導致整筆失敗。
- 節目無 RSS URL 或 URL 失效：不執行同步，前台顯示既有資料或佔位。
- 「Hosting provided by」多數 RSS 無標準 tag：可能需從 channel description 擷取或留空。
- 逐字稿：若未來要顯示，需決定來源（自轉／Spotify 創作者後台下載／第三方），本規格以「釐清並記錄」為主。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 節目詳情／單集頁須能顯示節目圖片、節目名稱、主持人、關於、Hosting provided by（若有）、Tags，資料來源為可從 RSS 同步的欄位。
- **FR-002**: 單集詳情頁須能顯示**單集說明**（即 RSS item description／節目自己填的說明）。
- **FR-003**: 系統須支援從節目 RSS Feed 同步節目級與單集級欄位至既有資料模型（Show / Episode 或擴充欄位）。
- **FR-004**: research.md 須記錄 RSS 欄位對應（節目／單集）與「Spotify 逐字稿是否可下載」之結論與替代方案。

### Non-Functional Requirements

- **NFR-001**: RSS 解析與寫入須能處理常見 podcast RSS（RSS 2.0 + iTunes namespace）；異常欄位不導致同步中斷。
- **NFR-002**: 前台顯示之使用者產生內容（說明、關於）須經安全處理（如跳脫或有限 HTML），避免 XSS。

### Key Entities

- **Show（節目）**: 擴充或對應 RSS channel：圖片、名稱、主持人、關於、Hosting 文字、Tags（對應 itunes:category 等）。
- **Episode（單集）**: 擴充或對應 RSS item：單集說明（episode description）、duration 等；與既有 ai_summary、host_notes 區分。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 節目／單集頁面能顯示來自 RSS 的節目圖片、名稱、主持人、關於、Hosting、Tags。
- **SC-002**: 單集頁面能顯示**單集說明**且與 AI 大綱、站長心得區分。
- **SC-003**: 至少一種可重現的「RSS 同步」流程（手動或排程），能更新上述欄位。
- **SC-004**: research.md 中已記錄 Spotify 逐字稿可行性與逐字稿來源策略。

## Assumptions

- 既有 Show / Episode 資料結構可擴充欄位或新增對應表；不強制改動既有 n8n 寫入流程，RSS 同步可為獨立或補充流程。
- 「Hosting provided by」可能不在 RSS 標準 tag 中，需從 description 擷取或留空。
- 逐字稿顯示／下載為後續擴充；本 feature 以「釐清來源並記錄」為主。

## Clarifications

### Session 2026-01-30

- Q: 節目圖片、名稱、主持人、關於、Hosting、Tags 從哪裡來？ → A: 從 RSS Feed（channel / item）下載並同步至資料庫，前台再從 API 讀取。
- Q: 每一集的「說明」從哪裡來？ → A: RSS 每個 &lt;item&gt; 的 &lt;description&gt;（節目自己填的說明），與 AI 大綱、站長心得分開顯示。
- Q: Spotify 逐字稿可以下載嗎？ → A: 依 Phase 0 研究結果記錄於 research.md；若官方無 API，則建議維持自轉或使用第三方工具，本 feature 不實作逐字稿下載，僅記錄策略。
- Q: 單集詳情頁上來自 RSS &lt;item&gt;&lt;description&gt; 的內容，規格與 UI 統一用語？ → A: 單集說明（必要時註明即 RSS episode description／節目自己填的說明）。

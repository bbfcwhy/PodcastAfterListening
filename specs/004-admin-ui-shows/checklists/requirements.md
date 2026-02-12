# Requirements Quality Checklist: 後台 UI 風格統一與節目管理

**Purpose**: 嚴謹審查 spec.md 的需求品質，專注於邊界情況覆蓋、非功能性需求、設計 tokens 一致性
**Created**: 2026-01-31
**Feature**: [spec.md](../spec.md)
**Depth**: Rigorous（嚴謹）
**Focus Areas**: Edge Cases, NFRs, Design Token Consistency

---

## Requirement Completeness（需求完整性）

- [ ] CHK001 - 設計 tokens 清單是否完整定義？spec 僅列出 canvas、surface、text-primary、cta、hover、selected、border-subtle，是否涵蓋所有後台使用情境？ [Completeness, Spec §FR-001]
- [ ] CHK002 - 節目欄位驗證規則是否完整定義？name 和 slug 為必填，但缺少長度限制、字元格式等具體驗證規則 [Gap, Spec §FR-007]
- [ ] CHK003 - 節目列表每頁顯示筆數是否明確定義？plan.md 提到約 20 筆，但 spec.md 未明確規範 [Gap, Spec §FR-004]
- [ ] CHK004 - 側邊欄「節目管理」連結的位置順序是否明確定義？是在「儀表板」之後還是其他位置？ [Gap, Spec §FR-009]
- [ ] CHK005 - 節目封面圖片的尺寸規格與顯示比例是否定義？ [Gap]
- [ ] CHK006 - 節目 slug 的格式規範是否完整定義？僅說明需唯一，未定義允許的字元集 [Gap, Spec §FR-007]
- [ ] CHK007 - 表單「取消」操作的行為是否定義？是返回列表頁還是上一頁？ [Gap]
- [ ] CHK008 - 節目建立成功後的導向目標是否明確？US4 說明導向列表頁，但編輯成功後的行為未定義 [Spec §US3 vs §US4]

---

## Requirement Clarity（需求清晰度）

- [ ] CHK009 - 「與前台一致的視覺風格」是否有可量化的驗收標準？目前僅描述使用相同 tokens，未定義比對方法 [Clarity, Spec §SC-001]
- [ ] CHK010 - 「主按鈕」與「次要按鈕」的使用時機是否明確定義？何時使用 bg-cta，何時使用 border-cta？ [Clarity, Spec §US1-AS2]
- [ ] CHK011 - 「適當圖示（如 Radio 或 Podcast icon）」是否確定最終選擇？ [Ambiguity, Spec §FR-009]
- [ ] CHK012 - 「顯示成功訊息」的呈現方式是否定義？Toast、內嵌訊息、或其他形式？ [Clarity, Spec §US3-AS2]
- [ ] CHK013 - 「顯示錯誤訊息」的呈現位置與樣式是否定義？欄位旁、表單頂部、或 Toast？ [Clarity, Spec §US3-AS3]
- [ ] CHK014 - 「預設佔位圖」的具體外觀是否定義？顏色、圖示、尺寸？ [Clarity, Edge Cases]
- [ ] CHK015 - 衝突提示的「重新載入或覆蓋選項」UI 規格是否定義？按鈕文字、排列方式？ [Clarity, Edge Cases]

---

## Requirement Consistency（需求一致性）

- [ ] CHK016 - 設計 tokens 命名是否與 002-ui-reference-style 規格一致？spec 使用 `bg-canvas` 但需確認實際 CSS class 名稱 [Consistency, Spec §Assumptions]
- [ ] CHK017 - 表格樣式要求是否與既有 EpisodeTable、CommentModerationTable 一致？ [Consistency, Spec §FR-003]
- [ ] CHK018 - ShowForm 的衝突處理機制是否與 EpisodeForm 行為一致？ [Consistency, Spec §FR-008]
- [ ] CHK019 - 分頁元件樣式是否與其他後台頁面（episodes, comments）一致？ [Consistency]
- [ ] CHK020 - slug 唯一性驗證錯誤訊息是否與其他類似驗證（如 episode slug）一致？ [Consistency, Spec §FR-007]
- [ ] CHK021 - 後台 layout 側邊欄各連結的 hover/selected 狀態是否一致定義？ [Consistency, Spec §FR-002]

---

## Acceptance Criteria Quality（驗收標準品質）

- [ ] CHK022 - SC-001「管理員能辨識出相同的主色、背景層級與按鈕風格」是否可客觀驗證？缺少具體比對方法 [Measurability, Spec §SC-001]
- [ ] CHK023 - SC-002 硬編色碼檢查是否有完整的搜尋範圍定義？僅檢查元件還是包含 CSS 檔案？ [Measurability, Spec §SC-002]
- [ ] CHK024 - 各 User Story 的 Acceptance Scenarios 是否涵蓋所有 edge cases？ [Coverage]
- [ ] CHK025 - 節目列表分頁的驗收場景是否定義？如何確認分頁正常運作？ [Gap, Spec §US2-AS3]
- [ ] CHK026 - 「資料庫更新成功」的驗證方式是否定義？透過 UI 訊息還是直接查詢資料庫？ [Measurability, Spec §US3-AS2]

---

## Edge Case Coverage（邊界情況覆蓋）

- [ ] CHK027 - 節目列表為空（zero-state）時的顯示內容是否定義？ [Edge Case, Gap]
- [ ] CHK028 - 封面圖片 URL 無效時的 fallback 行為是否完整定義？僅說明「顯示預設佔位圖」，未定義觸發條件 [Edge Case, Spec §Edge Cases]
- [ ] CHK029 - 節目名稱或描述包含特殊字元（HTML、emoji）時的處理是否定義？ [Edge Case, Gap]
- [ ] CHK030 - 網路中斷時的 API 呼叫失敗處理是否定義？ [Edge Case, Gap]
- [ ] CHK031 - 並發編輯衝突發生時，「覆蓋」操作是否需要二次確認？ [Edge Case, Spec §Edge Cases]
- [ ] CHK032 - slug 輸入時的即時驗證還是僅在送出時驗證？ [Edge Case, Gap]
- [ ] CHK033 - 節目描述欄位的最大長度限制是否定義？超過時如何處理？ [Edge Case, Gap]
- [ ] CHK034 - cover_image_url 和 original_url 的 URL 格式驗證是否定義？ [Edge Case, Gap]
- [ ] CHK035 - 表單載入中狀態（如編輯頁取得資料中）是否定義？ [Edge Case, Gap]
- [ ] CHK036 - 節目不存在時（404）的錯誤頁面是否定義？ [Edge Case, Gap]
- [ ] CHK037 - 未授權存取後台時的行為是否定義？ [Edge Case, Gap]

---

## Non-Functional Requirements（非功能性需求）

### Performance（效能）

- [ ] CHK038 - 列表頁載入效能目標是否量化定義？plan.md 提到「儲存回饋 5 秒內」但列表載入時間未定義 [NFR, Gap]
- [ ] CHK039 - 分頁每頁 20 筆是否為硬性規定？是否需要支援使用者調整？ [NFR, Spec §Plan]
- [ ] CHK040 - 圖片載入效能策略是否定義？是否需要 lazy loading 或縮圖？ [NFR, Gap]

### Accessibility（可及性）

- [ ] CHK041 - 表格的螢幕閱讀器支援是否定義？如 aria-label、role 等 [Accessibility, Gap]
- [ ] CHK042 - 表單欄位的錯誤訊息是否支援 aria-describedby 關聯？ [Accessibility, Gap]
- [ ] CHK043 - 側邊欄導覽的鍵盤操作是否定義？Tab 順序、Enter/Space 觸發？ [Accessibility, Gap]
- [ ] CHK044 - 色彩對比度是否符合 WCAG 標準？設計 tokens 是否經過對比度驗證？ [Accessibility, Gap]
- [ ] CHK045 - 表單必填欄位的視覺與語意標示是否定義？ [Accessibility, Gap]
- [ ] CHK046 - 成功/錯誤訊息是否支援 role="alert" 或 aria-live？ [Accessibility, Gap]

### Security（安全性）

- [ ] CHK047 - 後台存取權限驗證是否在 spec 中明確定義？plan.md 提到 is_admin 檢查但 spec 未詳述 [Security, Gap]
- [ ] CHK048 - API 端點的認證與授權機制是否定義？ [Security, Gap]
- [ ] CHK049 - XSS 防護策略是否定義？使用者輸入（名稱、描述）的 sanitization？ [Security, Gap]

---

## Design Token Consistency（設計 Tokens 一致性）

- [ ] CHK050 - spec 中列出的所有設計 tokens 是否與 globals.css 實際定義一致？ [Consistency, Spec §Key Entities]
- [ ] CHK051 - 「bg-selected」token 是否在 002-ui-reference-style 中有定義？spec 使用但需確認來源 [Consistency, Spec §FR-002]
- [ ] CHK052 - 深色主題（dark mode）的設計 tokens 對應是否定義？ [Gap]
- [ ] CHK053 - 設計 tokens 的語意命名（canvas vs background）是否有文件說明使用時機？ [Clarity, Gap]
- [ ] CHK054 - 表單元件（Input、Textarea、Button）是否統一使用設計 tokens？ [Consistency]
- [ ] CHK055 - shadcn/ui 元件的預設樣式與設計 tokens 的整合方式是否定義？ [Gap]

---

## Dependencies & Assumptions（依賴與假設）

- [ ] CHK056 - 假設「延續 002-ui-reference-style 已定義的設計 tokens」是否已驗證？ [Assumption, Spec §Assumptions]
- [ ] CHK057 - 假設「節目管理功能不包含刪除節目」是否有明確理由說明？日後擴充的條件為何？ [Assumption, Spec §Assumptions]
- [ ] CHK058 - 假設「使用與 EpisodeForm 相同的衝突處理模式」是否有文件連結？ [Assumption, Spec §Assumptions]
- [ ] CHK059 - Supabase shows 表的 RLS 政策是否在規格中說明？ [Dependency, Gap]
- [ ] CHK060 - 既有 Show 型別定義是否與 spec 欄位完全一致？ [Dependency]

---

## Ambiguities & Conflicts（模糊與衝突）

- [ ] CHK061 - FR-001 要求「所有頁面」使用設計 tokens，是否包含錯誤頁面、loading 狀態？ [Ambiguity, Spec §FR-001]
- [ ] CHK062 - US2 和 US3 優先級相同（P2），執行順序是否明確？ [Ambiguity]
- [ ] CHK063 - 「管理員」角色定義是否明確？is_admin=true 的使用者？ [Ambiguity, Spec §Plan]
- [ ] CHK064 - 節目「編輯」與「檢視」是否為同一頁面？spec 僅提到編輯頁 [Ambiguity]

---

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline after each item
- Reference spec sections using `[Spec §X]` format
- Markers: `[Gap]` = missing requirement, `[Ambiguity]` = unclear wording, `[Consistency]` = alignment check needed
- Total items: 64

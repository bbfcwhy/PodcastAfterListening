# Research: 節目／單集 RSS 欄位與逐字稿來源

**Date**: 2026-01-30
**Branch**: `005-rss-metadata-transcript`

## Research Topics

### 1. RSS Podcast Feed 節目級欄位對應

**Decision**: 依 RSS 2.0 + iTunes namespace 對應節目（channel）與單集（item）欄位。

**Rationale**:
- Podcast RSS 普遍使用 `<channel>` 為節目、`<item>` 為單集；iTunes 擴充為業界標準（Apple Podcasts、Spotify 等皆支援）。
- 節目圖片、名稱、主持人、關於、Tags 在 RSS 中皆有對應或可推導欄位。

**RSS Channel → 節目（Show）對應**:

| 網站顯示 | RSS / iTunes 欄位 | 說明 |
|----------|-------------------|------|
| 節目圖片 | `<itunes:image href="...">` | 建議 1400×1400～3000×3000，JPEG/PNG |
| 節目名稱 | `<title>` | 節目名稱 |
| 主持人 | `<itunes:author>` 或 `<itunes:owner><itunes:name>` | 多數 feed 用 author 表示創作者／主持人；多主持人需從 description 擷取或僅存一筆 |
| 關於 | `<description>` 或 `<itunes:summary>` | 節目描述；itunes:summary 可至 4000 字元 |
| Hosting provided by | 無標準 tag | 多為託管商在頁面或 description 中寫入「Hosting provided by XXX」；可從 channel description 用關鍵字擷取或留空 |
| Tags | `<itunes:category text="...">` | 可有多個；可對應既有 Tag 表或存成 JSON/陣列 |

**Alternatives considered**:
- 僅用 description 擷取所有文字：易錯、難維護，不採用。
- 自訂 namespace：非標準，其他平台未必支援，不採用。

---

### 2. RSS 單集（item）欄位對應

**Decision**: 單集「節目自己填的說明」對應 `<item><description>`；duration 對應 `<itunes:duration>`。

**Rationale**:
- RSS 2.0 的 `<item>` 內 `<description>` 即為該集說明（節目自己填的）。
- `<itunes:duration>` 可為 HH:MM:SS 或秒數，可轉成秒存於既有 Episode.duration_seconds。
- `<pubDate>` 可對應 published_at；`<guid>` 可作為 episode 唯一識別（與既有 original_url 或 episode_id 對應）。

**RSS Item → 單集（Episode）對應**:

| 網站顯示 | RSS / iTunes 欄位 | 說明 |
|----------|-------------------|------|
| 節目自己填的說明 | `<item><description>` | 單集說明，可含 HTML；儲存時須安全處理 |
| 時長 | `<itunes:duration>` | 轉成秒數 |
| 發布日 | `<pubDate>` | RFC 2822，轉成 DATE |
| 唯一識別 | `<guid>` | 可與 n8n 的 episode_id 或 original_url 對應，用於 upsert |

**Alternatives considered**:
- 使用 `<content:encoded>`：部分 feed 有，可作為 description 的補充或替代；實作時可優先 content:encoded 若存在。

---

### 3. Spotify 逐字稿是否可下載

**Decision**: **無法透過官方 API 程式下載**；逐字稿來源不依賴 Spotify 官方 API。

**Rationale**:
- Spotify 官方文件與社群確認：**無提供 podcast transcript 的公開 API** 供程式下載。
- 創作者可在 Spotify for Creators 後台上傳／下載逐字稿（VTT/SRT），但僅限創作者本人，且非對外 API。
- 若需「不用自己轉逐字稿」，可行替代方案：
  1. **創作者提供**：若節目方有提供逐字稿檔或 RSS 內嵌（少數延伸規格），可匯入。
  2. **自轉**：維持既有語音轉文字流程（如 n8n + 語音辨識服務）。
  3. **第三方工具**：如 SpotScribe、GitHub 上的 SpotifyTranscripts 等，多為「貼上 Spotify 連結→取得逐字稿」，非官方、需評估授權與穩定性。

**Alternatives considered**:
- 依賴 Spotify API：無此 API，不可行。
- 僅依賴創作者後台下載：需手動，不適合自動化；可文件說明供站長手動匯入若未來有欄位。

**結論（供規格與實作參考）**:
- 本 feature **不實作**「從 Spotify 下載逐字稿」；若未來要顯示逐字稿，建議維持「自轉」或「創作者／第三方提供檔案匯入」。
- research.md 已記錄上述結論，供後續「逐字稿顯示」相關 task 參考。

---

### 4. Hosting provided by 來源

**Decision**: RSS 無標準 tag；可選從 channel `<description>` 或 `<itunes:summary>` 以關鍵字擷取「Hosting provided by XXX」，或欄位留空。

**Rationale**:
- 多數託管商會在 feed 或網頁寫入「Hosting provided by SoundOn」等；RSS 本身無專用 tag。
- 實作可：正則或關鍵字擷取 description 中 "Hosting provided by ..." 段落；若無則不寫入或顯示「—」。

**Alternatives considered**:
- 不顯示：若產品希望精簡，可不在前台顯示；規格保留欄位以利未來擴充。

---

### 5. RSS 解析與同步技術選型

**Decision**: 使用 Node 環境可解析 XML 的套件（如 `fast-xml-parser` 或 `rss-parser`）於 server 端解析 RSS；同步邏輯可為 API Route 或背景 job，寫入 Supabase。

**Rationale**:
- `rss-parser` 常用於 Node 解析 podcast feed，支援 iTunes 與 content  namespace。
- 同步可設計為：輸入 show_id 或 RSS URL → 抓取 feed → 解析 channel / items → 更新 Show 與 Episode 欄位（upsert）；失敗或缺欄位時記錄 log、不中斷整批。

**Alternatives considered**:
- 瀏覽器端解析：CORS 與安全性不適合；不採用。
- 外部服務代抓 RSS：增加依賴與成本；若規模不大可先自幹。

---

## Summary Table

| 項目 | 結論 |
|------|------|
| 節目圖片／名稱／主持人／關於／Tags | 從 RSS channel 對應 itunes:image, title, author, description/summary, itunes:category |
| Hosting provided by | 無標準 tag；可從 description 擷取或留空 |
| 單集「節目說明」 | 從 RSS item description（及可選 content:encoded） |
| Spotify 逐字稿下載 | 無官方 API；不實作下載；維持自轉或創作者／第三方匯入，策略已記錄 |

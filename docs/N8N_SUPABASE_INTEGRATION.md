# n8n 與 Supabase 整合：AI 分析結果上傳

本文件說明如何把現有三個 n8n workflow（巡邏、逐字稿、自動撰文）的結果上傳到 Supabase，以及要填寫的欄位與整合方式。並說明 **RSS 同步** workflow 的用法。

---

## RSS 同步 workflow：n8n-workflow-rss-sync.json

專案根目錄的 **n8n-workflow-rss-sync.json** 會從 Supabase 讀取「有填 `rss_feed_url` 的節目」，對每個節目呼叫網站的 `POST /api/admin/shows/{id}/sync-rss`，把 RSS 的節目／單集資訊寫回 Supabase（節目圖、名稱、關於、Hosting、Tags、單集說明等），前台即顯示最新資料。

**使用前準備：**

1. **網站環境變數**（.env.local）
   - `RSS_SYNC_API_KEY`：自訂一組密鑰（供 n8n 帶在 header 驗證）
   - `SUPABASE_SERVICE_ROLE_KEY`：Supabase 專案 → Settings → API → service_role key（API Key 驗證時會用此寫入 DB）

2. **n8n**
   - 匯入 `n8n-workflow-rss-sync.json`
   - 新增 **Supabase** 認證（同專案）
   - 在「設定 API 參數」節點填：`base_url`（網站根網址）、`api_key`（與 RSS_SYNC_API_KEY 相同）

3. **Supabase**
   - 在 `shows` 表為要同步的節目填上 `rss_feed_url`

**觸發**：手動執行或啟用「排程觸發 (可選)」定時跑。每次執行會對所有有 RSS 的節目各呼叫一次 sync-rss API。

---

## 四條 workflow 與 RSS 同步：改哪一條？

你現在有四條 n8n workflow，若要把「從 RSS 更新節目／單集到 Supabase」接進去，建議如下。

| Workflow | 用途 | 與 RSS 同步的關係 | 建議 |
|----------|------|-------------------|------|
| **PAL_巡邏** | 從 Subscriptions 讀 feed_url，讀 RSS，把新單集寫入 Episodes 表 | 已經在讀 RSS、手上有 feed_url 與 podcast_id；每巡邏一個節目就等於「該節目有更新」 | **最適合**：在「寫入 Episodes」之後，用 podcast_id 查 Supabase shows 拿 show id，呼叫 POST sync-rss，該節目的節目級與單集級欄位就會同步到網站 |
| **PAL_自動撰文** | 從 Episodes 拿 status=srt_uploaded，下載 SRT、撰文、審稿通過後「準備 Supabase 單集資料 → Upsert 單集到 Supabase」 | 已經會寫入 Supabase 單集；在 Upsert 之後對該 show_id 呼叫 sync-rss，可補齊節目圖、關於、單集說明等 | **次選**：在「Upsert 單集到 Supabase」之後加一步「呼叫 RSS 同步 API」（帶 show_id），每次上傳單集後該節目與單集的 RSS 元資料一併更新 |
| **PAL_上傳到Supabase_v2** | 從 Google Drive 草稿讀 Doc，解析業配／節目內容，查/建 Show，上傳單集到 Supabase | 也是「寫入 Supabase 單集」；在寫入之後對該 show 呼叫 sync-rss 同樣可補齊 RSS 欄位 | **可選**：同上，在寫入 Supabase 之後加「呼叫 sync-rss」 |
| **PAL_逐字稿** | 從 Episodes 拿 status=new，下載音檔、轉寫、上傳 SRT、更新表單 | 不直接寫 Supabase，也不讀 RSS；加 RSS 同步意義不大 | **不建議**：維持現狀即可 |

**結論**  
- **優先改 PAL_巡邏**：資料流一致（RSS → 巡邏 → 寫入 Episodes + 同步到 Supabase），一次巡邏就同時更新 Sheets 與網站節目／單集。  
- **若你希望「每次有單集寫入 Supabase 後才更新 RSS 元資料」**，就改 **PAL_自動撰文** 或 **PAL_上傳到Supabase_v2**，在「寫入 Supabase」之後加一步呼叫 `POST /api/admin/shows/{show_id}/sync-rss`（需帶 header `X-RSS-Sync-Key`）。

**PAL_巡邏 插入點（建議）**  
1. 在「寫入 Episodes」節點之後，加一個 **Supabase** 節點：查 `shows` 表，filter `slug = {{ $('Loop Over Items').first().json.podcast_id }}`（或你 Subscriptions 裡對應節目 slug 的欄位），取 `id`。  
2. 再加一個 **HTTP Request** 節點：`POST {{ 你的網站 base_url }}/api/admin/shows/{{ $json.id }}/sync-rss`，header `X-RSS-Sync-Key: {{ 你的 RSS_SYNC_API_KEY }}`。  
這樣每巡邏完一個節目、寫入新單集到 Episodes 後，就會對該節目跑一次 RSS 同步，網站上的節目圖、關於、Hosting、Tags、單集說明等會更新。

---

## 已直接修改的 workflow：PAL_自動撰文.json

已在 **PAL_自動撰文.json** 裡加上兩個節點，接在「更新表單狀態」之後：

1. **準備 Supabase 單集資料**（Code）：從「下載 SRT 檔案」「取得長文」「排版並且加上 CTA」「Merge」「將文章貼到 Google doc」等節點彙整一筆要寫入 Supabase 的物件（episode_id、title、published_at、summary、sponsorship_info、slug、summary_doc_url、srt_file_url 等）。
2. **Upsert 單集到 Supabase**（Supabase）：對表 `podcast_episodes` 做 Upsert，Conflict 欄位為 `episode_id`。

流程變為：**更新表單狀態** → **準備 Supabase 單集資料** → **Upsert 單集到 Supabase** → **Loop Over Items**。

**你需要做的事：**

1. 在 n8n 新增 **Supabase** 認證（Host = 專案 API URL，Service Role Key），記下認證 ID。
2. 在 workflow 裡點開「Upsert 單集到 Supabase」節點，把 `credentials.supabaseApi.id` 從 `YOUR_SUPABASE_CREDENTIAL_ID` 改成你剛建立的認證 ID（或在 n8n UI 選取該 Supabase 帳號）。
3. 若你的 n8n Supabase 節點版本不同，Upsert 的「Conflict / Merge key」請設成 `episode_id`。
4. `show_id` 目前在 Code 裡固定為 `null`（單集先不關聯節目）；之後可在後台手動關聯，或在前述 Code 前加「查 shows 表」節點再帶入 show_id。

匯入修改後的 JSON 後，執行一次自動撰文流程，審核通過、更新表單狀態後就會自動寫入 Supabase。

---

## 一、Supabase 要寫入的表格與欄位

### 1. 節目表 `shows`（需先存在，單集才能關聯）

| 欄位 | 型別 | 必填 | 說明 | n8n 建議來源 |
|------|------|------|------|----------------|
| id | UUID | 自動 | 主鍵 | 不填（Supabase 產生） |
| name | TEXT | ✓ | 節目名稱 | 來自 Subscriptions 的節目名稱，或 podcast_id 對應表 |
| slug | TEXT | ✓ | URL 用代碼（唯一） | 用 name 產生，例如 `slugify(name)` 或固定對照表 |
| description | TEXT | 選 | 節目簡介 | 可空或從 RSS 描述 |
| cover_image_url | TEXT | 選 | 封面圖 URL | 可空 |
| original_url | TEXT | 選 | 官方/RSS 連結 | 可空 |
| created_at / updated_at | TIMESTAMPTZ | 自動 | 時間戳 | 不填 |

**重點**：`podcast_episodes.show_id` 要指向 `shows.id`。做法二選一：

- **做法 A**：在 Supabase 先手動建立節目（或用 seed），n8n 只查 `shows.slug = podcast_id` 或自建對照表取得 `show_id`。
- **做法 B**：在 n8n 裡若該 `podcast_id` 尚無對應 show，先 INSERT `shows`（name、slug），再拿回來的 id 當 show_id。

---

### 2. 單集表 `podcast_episodes`（AI 分析結果寫這裡）

寫入時以 **episode_id（對應你的 episode_guid）** 為唯一鍵，有則 UPDATE、無則 INSERT。

| Supabase 欄位 | 型別 | 必填 | 說明 | n8n 建議來源 |
|---------------|------|------|------|----------------|
| **id** | UUID | 自動 | 主鍵 | 不填（INSERT 時自動） |
| **episode_id** | TEXT | ✓ 唯一 | 外部單集 ID | Google Sheets `episode_guid`（必填，用來比對是否已存在） |
| **title** | TEXT | ✓ | 單集標題 | Sheets `episode_title` |
| **description** | TEXT | 選 | 單集描述 | 可空或 RSS description |
| **published_at** | TIMESTAMPTZ | 選 | 發布時間 | Sheets `pub_date` 轉成 ISO（例：`new Date(pub_date).toISOString()`） |
| **audio_file_url** | TEXT | 選 | 音檔 URL | Sheets `enclosure_url` 或 Google Drive 音檔連結 |
| **srt_file_url** | TEXT | 選 | 字幕檔 URL | Drive SRT 檔的「取得連結」URL（或固定前綴 + drive_srt_file_id） |
| **summary_doc_url** | TEXT | 選 | 摘要/長文文件 URL | `https://docs.google.com/document/d/{{ drive_doc_file_id }}/edit` |
| **reflection_doc_url** | TEXT | 選 | 反思文件 URL | 若有另一份 Doc 再填，否則可空 |
| **sponsorship_info** | JSONB | 選 | 業配結構化資料 | 自動撰文裡「業配」段落的結構化 JSON；若只有純文字可放 `{"text": "..."}` |
| **summary** | TEXT | 選 | AI 長文摘要（後端用） | 自動撰文「取得長文」的 content，或「排版並且加上 CTA」的 formatted_text |
| **reflection** | TEXT | 選 | 反思/快速回顧（後端用） | 自動撰文「快速回顧」AI 的 output |
| **processed_at** | TIMESTAMPTZ | 選 | 處理完成時間 | n8n 執行當下 `$now.toISO()` |
| **show_id** | UUID | 選 | 所屬節目 | 從 `shows` 表用 podcast_id/slug 查到的 id |
| **slug** | TEXT | 選 | URL 用代碼 | 用 title 產生，例如 slugify(title)，同一 show 下要不重複 |
| **original_url** | TEXT | 選 | 原始單集連結 | RSS item 的 link（若巡邏有傳下來） |
| **is_published** | BOOLEAN | 預設 false | 是否對外顯示 | 先填 `false`，之後在後台手動上架 |
| **duration_seconds** | INTEGER | 選 | 時長（秒） | 若有從轉寫/音檔取得再填 |
| **ai_summary** | TEXT | 選 | 前端顯示用摘要 | 同 summary，或由 DB trigger 從 summary 同步 |
| **ai_sponsorship** | TEXT | 選 | 前端顯示用業配文字 | 業配純文字；或由 DB trigger 從 sponsorship_info 同步 |
| **host_notes** | TEXT | 選 | 前端顯示用反思 | 同 reflection，或由 DB trigger 同步 |
| **created_at / updated_at** | TIMESTAMPTZ | 自動 | 時間戳 | 不填或交給 DB default |

**觸發器說明**：DB 已有 trigger 會把 `summary` ↔ `ai_summary`、`reflection` ↔ `host_notes`、`sponsorship_info` ↔ `ai_sponsorship` 同步，所以 n8n 只要寫 **summary、reflection、sponsorship_info** 三類其中之一，前端欄位會自動被更新。

---

## 二、三個 workflow 的資料流與 Supabase 插入時機

```
PAL_巡邏 → 新單集寫入 Google Sheets (Episodes)，status = new
    ↓
PAL_逐字稿 → 讀 status=new → 下載音檔、轉逐字稿、上傳 SRT → 更新 Sheets status=srt_uploaded
    ↓
PAL_自動撰文 → 讀 status=srt_uploaded → 下載 SRT、AI 撰文、貼到 Google Doc、人工審核 → 更新 Sheets status=doc_uploaded
    ↓
【新增】上傳 Supabase → 讀取該筆 Episodes 列 + 長文內容 → INSERT/UPDATE podcast_episodes（+ 必要時建立/查詢 shows）
```

**建議**：在 **PAL_自動撰文** 中，在「Update Episodes sheet（status=doc_uploaded）」之後加一個「上傳 Supabase」的步驟；或另開一個 **PAL_上傳Supabase** workflow，由「Episodes 有 doc_uploaded」觸發（例如定時查 Sheets 或 webhook）。

---

## 三、n8n 裡 Supabase 節點要怎麼填

### 1. 連線

- 在 n8n 新增 **Supabase** 認證，填寫：
  - **Host**：專案的 API URL（例：`https://xxxxx.supabase.co`）
  - **Service Role Key**（或可寫入的 API Key）：用於後端寫入，避免被 RLS 擋下。

### 2. 先確保有節目（shows）

- **若 Supabase 已手動建好節目**：用 **Supabase: Get many** 或 **Execute SQL** 依 `slug`（或自建 podcast_id 對照欄）查 `shows`，得到 `show_id`。
- **若要在 n8n 建節目**：用 **Supabase: Insert** 表 `shows`，欄位至少：`name`、`slug`（必填），其餘可選；插入後從回傳取 `id` 當後續的 `show_id`。

### 3. 單集：INSERT 或 UPSERT

- **做法 A（推薦）**：用 **Supabase: Upsert**，表選 `podcast_episodes`，  
  - **Conflict columns**：選 `episode_id`（對應你的 episode_guid）。  
  - 其餘欄位用「從上一個節點」的 expression 對應，例如：
  - `episode_id` = `{{ $json.episode_guid }}`
  - `title` = `{{ $json.episode_title }}`
  - `published_at` = `{{ $json.pub_date }}`（若格式不是 ISO，先用 Code 節點轉成 ISO 字串）
  - `audio_file_url` = `{{ $json.enclosure_url }}`
  - `srt_file_url` = 從 Drive 連結或 `drive_srt_file_id` 組出 URL
  - `summary_doc_url` = `https://docs.google.com/document/d/{{ $json.drive_doc_file_id }}/edit`
  - `summary` = 自動撰文流程中「取得長文」的 `content`，或你整理好的長文欄位
  - `reflection` = 自動撰文「快速回顧」的 output（若有）
  - `sponsorship_info` = 業配 JSON（若只有純文字：`{"text": "{{ $json.業配內容 }}"}`）
  - `show_id` = 上一步查到的 UUID
  - `slug` = 用 Code 節點從 title 做 slugify（且同一 show 下不重複）
  - `processed_at` = `{{ $now.toISO() }}`
  - `is_published` = `false`

- **做法 B**：先 **Supabase: Get many** 用 `episode_id = episode_guid` 查，有則 **Update**，無則 **Insert**（需自己帶入 id 或交給 DB 產生）。

---

## 四、欄位對照總表（Sheets / 自動撰文 → Supabase）

| Google Sheets (Episodes) / 流程變數 | Supabase podcast_episodes 欄位 | 備註 |
|-------------------------------------|--------------------------------|------|
| episode_guid | episode_id | 必填，唯一 |
| episode_title | title | 必填 |
| pub_date | published_at | 轉成 TIMESTAMPTZ |
| enclosure_url | audio_file_url | 選填 |
| drive_srt_file_id | srt_file_url | 需轉成可存取的 URL |
| drive_doc_file_id | summary_doc_url | 組成 Google Doc URL |
| （自動撰文）長文 content / formatted_text | summary | 觸發會同步到 ai_summary |
| （自動撰文）快速回顧 output | reflection | 觸發會同步到 host_notes |
| （自動撰文）業配段落 | sponsorship_info（JSONB）或 ai_sponsorship（TEXT） | 觸發會雙向同步 |
| podcast_id → 查 shows | show_id | 必有關聯 |
| 從 title 產生 | slug | 同一 show 下不重複 |
| — | is_published | 建議先 false |
| $now | processed_at | 選填 |

---

## 五、整合方式建議

### 方案 A：在 PAL_自動撰文末尾直接加 Supabase 節點（推薦）

1. 在「Update Episodes sheet（status=doc_uploaded）」之後接一個 **Code** 節點，把目前這筆 Episodes 列 + 「取得長文」的 content（或「排版並且加上 CTA」的 formatted_text）+ 快速回顧、業配等，組成一筆物件，例如：
   - `episode_guid`, `episode_title`, `pub_date`, `enclosure_url`, `drive_srt_file_id`, `drive_doc_file_id`, `podcast_id`
   - `summary`（長文）, `reflection`（快速回顧）, `sponsorship_info` 或業配文字
2. 再接 **Supabase: Get many** 查 `shows`（例如 `slug = podcast_id` 或 name = podcast_id），得到 `show_id`；若沒有則先 **Insert** 一筆 show 再取 id。
3. 再接 **Supabase: Upsert** 到 `podcast_episodes`，Conflict 選 `episode_id`，其他欄位依上表對應。

優點：一氣呵成，審核通過、更新 Sheets 後立刻進 Supabase。  
注意：需在自動撰文流程裡能取到「長文」、「快速回顧」、「業配」等欄位（例如從前面節點用 `$('取得長文').item.json.content` 或等同的引用）。

### 方案 B：獨立「PAL_上傳Supabase」workflow

1. 觸發：定時（例如每 15 分鐘）或 Webhook。
2. 讀取 Google Sheets Episodes 中 `status = doc_uploaded` 且「尚未上傳 Supabase」的列（可加一欄 `supabase_synced_at` 或類似）。
3. 對每一列：用 drive_doc_file_id 讀 Google Doc 取得長文；若 Sheets 有存快速回顧/業配文字則直接用。
4. 查/建 shows → Upsert podcast_episodes（同上表）。
5. 更新該列 `supabase_synced_at` 或 status，避免重複上傳。

優點：與自動撰文解耦，可重跑、可補傳。  
缺點：要多維護一個 workflow 與 Sheets 欄位。

---

## 六、slug 與 show_id 實作提醒

- **slug**：同一 `show_id` 下不可重複。可用 title 做 slugify（去空白、標點、轉小寫、長度限制），若重複可加數字後綴（例如 `-2`）。前端路由為 `/episodes/[showSlug]/[episodeSlug]`，所以 slug 會用在 URL。
- **show_id**：一定要能從 `podcast_id` 對到一筆 show。若 Subscriptions 表有節目名稱，可用 name 當 `shows.name` 或 `shows.slug`，在 n8n 裡先查再插入單集。

---

## 七、總結：最少必填欄位

上傳一筆「AI 分析完成」的單集到 Supabase，**最少**要準備：

1. **shows**（若尚未存在）：`name`、`slug`。
2. **podcast_episodes**：  
   - 必填：`episode_id`（= episode_guid）、`title`（= episode_title）、`show_id`。  
   - 強烈建議：`published_at`、`summary`（長文）、`slug`、`is_published=false`。  
   - 選填：`audio_file_url`、`srt_file_url`、`summary_doc_url`、`reflection`、`sponsorship_info`、`processed_at`。

其餘欄位可之後在後台或後續 workflow 再補。寫入後，前端會透過 `episodes` 視圖讀到 `ai_summary`、`host_notes`、`ai_sponsorship`（由 DB trigger 從 summary、reflection、sponsorship_info 同步）。

---

## 八、PAL_自動撰文 workflow 節點引用對照（n8n 表達式）

在 n8n 裡要從「自動撰文」流程取資料時，可依節點名稱這樣引用（假設 Supabase 節點接在「更新表單狀態」之後、同一執行脈絡）：

| 要寫入 Supabase 的欄位 | 來源節點與表達式 |
|------------------------|------------------|
| episode_id | `$('下載 SRT 檔案').item.json.episode_guid` 或 `$('Get row(s) in sheet').item.json.episode_guid` |
| title | `$('Get row(s) in sheet').item.json.episode_title` 或 `$('Merge').first().json.title` |
| summary（長文） | `$('取得長文').item.json.content`（Google Doc 全文），或 `$('排版並且加上 CTA').item.json.formatted_text`（含標題+業配+內容+CTA） |
| reflection（快速回顧） | 若有「快速回顧」AI 節點：`$('快速回顧').item.json.output`；或「個人觀點」：`$('整理個人觀點').item.json.pov` |
| sponsorship_info / 業配 | `$('整理業配').item.json.sales` 或 `$('整理業配資訊').item.json.output`（可包成 JSONB：`{"text": "{{ ... }}"}`） |
| summary_doc_url | `https://docs.google.com/document/d/{{ $('將文章貼到 Google doc').item.json.documentId }}/edit` |
| podcast_id（用來查 show_id） | `$('Get row(s) in sheet').item.json.podcast_id` |
| pub_date | `$('Get row(s) in sheet').item.json.pub_date` |
| enclosure_url | 若 Sheets 有：`$('Get row(s) in sheet').item.json.enclosure_url` |
| drive_srt_file_id | `$('下載 SRT 檔案').item.json.drive_srt_file_id`（用於組 srt_file_url） |

**注意**：`$('節點名稱').item` 是「當前這筆 item」對應到該節點的輸出；若流程是 SplitInBatches 一筆一筆跑，通常就是同一筆單集。若你改成一次處理多筆，需用 `$('節點名稱').all()` 或依 index 取對應項。

若你提供「自動撰文」裡實際輸出長文/快速回顧/業配的節點名稱與欄位名，我可以幫你寫成對應的 n8n 欄位對照表或一小段 Code 節點範例（含 slugify、published_at 轉換）。

# 如何開啟後台並驗收功能

用來確認「後台輕鬆修改網站內容」功能是否完成。

---

## 1. 環境與帳號

- 專案根目錄要有 `.env.local`，內含：
  - `NEXT_PUBLIC_SUPABASE_URL`（你的 Supabase 專案 URL）
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Supabase 專案的 anon key）

**若還沒設定這兩個變數：** 網站仍可正常啟動、首頁可瀏覽；但造訪 `/admin` 時會被導回首頁，網址會帶上 `?error=supabase_not_configured`。  
到 [Supabase Dashboard → 你的專案 → Settings → API](https://supabase.com/dashboard/project/_/settings/api) 可取得 URL 與 anon key，複製到 `.env.local` 後重啟 `npm run dev` 即可。

- Supabase 裡要有一個**站長帳號**：該使用者在 `profiles` 表對應的那一筆，`is_admin` 必須為 `true`。

**若尚未設定 is_admin：**

1. 開啟 Supabase Dashboard → 你的專案 → **Table Editor** → 選 `profiles`。
2. 找到你要當站長的那個使用者（用 Auth 的 user id 對應 `profiles.id`）。
3. 把該筆的 `is_admin` 改成 `true` 並儲存。  
   若該使用者還沒有對應的 `profiles` 列，需先登入一次網站（會自動建立 profile），再到 Table Editor 把該筆的 `is_admin` 設為 `true`。

---

## 2. 啟動網站

在專案根目錄執行：

```bash
npm run dev
```

瀏覽器開：**http://localhost:3000**

---

## 3. 登入

- 若尚未登入：在首頁用「使用 Google 登入」等按鈕登入（依專案設定的登入方式）。
- 登入的帳號必須是上面在 `profiles` 設了 `is_admin = true` 的那一個；否則進不了後台。

---

## 4. 進入後台

網址列輸入：

- **http://localhost:3000/admin/dashboard**

或從首頁導覽到後台（若有連結）。  
若未登入或不是站長，會被導回首頁。

後台側欄可到：

- **儀表板**：`/admin/dashboard`
- **單集管理**：`/admin/episodes`（列表分頁、標題搜尋、上架狀態篩選、一鍵上架／下架）
- **留言審核**：`/admin/comments`（依狀態篩選、通過／隱藏／標記垃圾）
- **聯盟行銷**：`/admin/affiliates`（列表分頁）

---

## 5. 建議驗收項目

| 項目 | 怎麼驗收 |
|------|----------|
| 分頁 | 在單集／留言／聯盟列表切「下一頁」或頁碼，確認有分頁且每頁約 20 筆。 |
| 單集搜尋／篩選 | 在單集列表用「標題搜尋」或「上架狀態」篩選，確認結果正確。 |
| 單集上架／下架 | 在單集列表點某一筆的「上架」或「下架」，確認狀態與 toast；重新整理前台，確認該單集出現或消失。 |
| 編輯單集 | 進「編輯」→ 改標題或 AI 大綱 → 儲存，確認有成功訊息，並可選「返回列表」或繼續編輯。 |
| 未儲存提示 | 編輯單集時改幾個字但不儲存，點側欄離開或關分頁，應出現「有未儲存的變更，確定要離開嗎？」。 |
| 留言審核 | 在留言審核頁切換「待審核／已批准／已隱藏／垃圾」，對單筆按「通過」「隱藏」「標記垃圾」，確認列表會更新。 |
| 聯盟編輯 | 進聯盟行銷列表 → 編輯一筆 → 儲存，確認有成功回饋；若該筆在別處被改過，應有衝突提示（重新載入／覆蓋／放棄）。 |

更完整的驗收情境可看：`specs/003-admin-content-editing/quickstart.md`。

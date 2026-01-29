# E2E 測試修復記錄

## 問題 1：Playwright 瀏覽器未安裝

### 錯誤訊息
```
Error: browserType.launch: Executable doesn't exist at /Users/bbfcwhy/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell
```

### 解決方案
執行 `npx playwright install chromium` 安裝瀏覽器。

## 問題 2：AI 警語文字匹配失敗

### 錯誤訊息
```
Error: expect(locator).toBeVisible() failed
Locator: locator('text=以下內容由 AI 自動解析產生')
```

### 原因
實際的 AI 警語文字是：
```
以下內容由 AI 自動解析產生，僅供參考，一切以原始 Podcast 節目內容為準。
```

但測試在尋找完全匹配的 "以下內容由 AI 自動解析產生"。

### 解決方案
使用正則表達式進行部分匹配：

```typescript
// 修改前
const disclaimer = page.locator("text=以下內容由 AI 自動解析產生");

// 修改後
const disclaimer = page.locator("text=/以下內容由 AI 自動解析產生/");
```

## 修改的檔案

1. `tests/e2e/basic-navigation.spec.ts`
   - 更新 AI 警語選擇器使用正則表達式
   - 更新搜尋欄位選擇器添加 `.first()`

2. `tests/e2e/ai-disclaimer-visibility.spec.ts`
   - 更新 AI 警語選擇器使用正則表達式

## 相關資源

- [Playwright 文字選擇器](https://playwright.dev/docs/selectors#text-selector)
- [Playwright 正則表達式](https://playwright.dev/docs/selectors#regex)

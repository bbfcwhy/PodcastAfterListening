# Playwright 瀏覽器安裝指南

## 問題

執行 E2E 測試時出現錯誤：
```
Error: browserType.launch: Executable doesn't exist at /Users/bbfcwhy/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell
```

## 原因

Playwright 需要下載瀏覽器執行檔才能運行測試。當 Playwright 首次安裝或更新後，需要手動下載瀏覽器。

## 解決方案

### 安裝所有瀏覽器（推薦）

```bash
npx playwright install
```

這會下載所有支援的瀏覽器（Chromium、Firefox、WebKit）。

### 只安裝 Chromium（較快）

如果只需要 Chromium（目前測試配置使用的瀏覽器）：

```bash
npx playwright install chromium
```

### 安裝系統依賴（Linux）

在 Linux 系統上，可能還需要安裝系統依賴：

```bash
npx playwright install-deps
```

## 驗證安裝

安裝完成後，可以執行測試來驗證：

```bash
npm run test:e2e
```

## 自動化安裝

可以在 `package.json` 中添加 postinstall 腳本來自動安裝瀏覽器：

```json
{
  "scripts": {
    "postinstall": "playwright install --with-deps chromium"
  }
}
```

但這會讓 `npm install` 變慢，所以通常建議手動執行。

## 相關資源

- [Playwright 安裝文檔](https://playwright.dev/docs/intro#installation)
- [瀏覽器管理](https://playwright.dev/docs/browsers)

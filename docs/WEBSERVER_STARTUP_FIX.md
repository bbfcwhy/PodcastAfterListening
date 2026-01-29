# WebServer 啟動錯誤修復

## 問題

執行 E2E 測試時出現錯誤：
```
Error: Process from config.webServer was not able to start. Exit code: 1
```

## 根本原因

開發伺服器無法啟動，因為 `globals.css` 中有一個無法解析的 import：

```css
@import "tw-animate-css";
```

在 Tailwind CSS 4.x 中，這個 import 語法不正確。`tailwindcss-animate` 插件應該只使用 `@plugin` 指令，不需要額外的 `@import`。

## 解決方案

移除 `globals.css` 中的 `@import "tw-animate-css";` 行，只保留 `@plugin "tailwindcss-animate";`。

### 修復前

```css
@import "tw-animate-css";

@plugin "tailwindcss-animate";
```

### 修復後

```css
@plugin "tailwindcss-animate";
```

## 驗證

修復後，開發伺服器應該能夠正常啟動：

```bash
npm run dev
```

然後執行 E2E 測試：

```bash
npm run test:e2e
```

## 相關資源

- [Tailwind CSS 4.x 文檔](https://tailwindcss.com/docs)
- [tailwindcss-animate 插件](https://github.com/jamiebuilds/tailwindcss-animate)

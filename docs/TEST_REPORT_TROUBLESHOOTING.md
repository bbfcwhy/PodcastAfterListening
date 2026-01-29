# 測試報告疑難排解

## 問題：Port 9323 已被佔用

### 錯誤訊息

```
Error: listen EADDRINUSE: address already in use ::1:9323
```

### 原因

Playwright 的 `show-report` 命令會啟動一個本地伺服器來顯示測試報告，預設使用 port 9323。如果這個 port 已經被佔用（例如之前的報告伺服器還在運行），就會出現這個錯誤。

### 解決方案

#### 方法 1：終止佔用 port 9323 的進程（推薦）

```bash
# 找出並終止佔用 port 9323 的進程
lsof -ti:9323 | xargs kill -9

# 或使用 pkill
pkill -f "playwright.*show-report"
```

#### 方法 2：使用不同的 port

```bash
# 使用自訂 port
npx playwright show-report --port 9324
```

#### 方法 3：直接打開 HTML 報告

如果不需要互動式報告伺服器，可以直接打開 HTML 檔案：

```bash
# macOS
open playwright-report/index.html

# Linux
xdg-open playwright-report/index.html

# Windows
start playwright-report/index.html
```

### 預防措施

#### 自動清理腳本

可以建立一個清理腳本：

```bash
#!/bin/bash
# scripts/cleanup-test-ports.sh

echo "Cleaning up test-related ports..."

# Kill Playwright report server
lsof -ti:9323 | xargs kill -9 2>/dev/null

# Kill any remaining Playwright processes
pkill -f "playwright.*show-report" 2>/dev/null

echo "Cleanup complete!"
```

#### 在測試前清理

在執行測試前先清理：

```bash
./scripts/cleanup-test-ports.sh && npm run test:e2e
```

## 其他常見問題

### 問題：測試報告未更新

**解決方案**：
1. 確認測試已執行完成
2. 檢查 `playwright-report/` 目錄的修改時間
3. 重新執行測試：`npm run test:e2e`

### 問題：報告無法打開

**解決方案**：
1. 確認 `playwright-report/index.html` 存在
2. 檢查檔案權限
3. 嘗試使用不同的瀏覽器打開

### 問題：報告顯示舊的測試結果

**解決方案**：
1. 刪除舊的報告：`rm -rf playwright-report/`
2. 重新執行測試：`npm run test:e2e`
3. 查看新報告：`npx playwright show-report`

## 最佳實踐

1. **測試後立即查看報告**：在測試執行完成後立即查看報告，避免端口被佔用
2. **定期清理**：定期清理測試相關的進程和端口
3. **使用 CI/CD**：在 CI/CD 環境中，報告會自動生成，不需要本地伺服器

## 相關資源

- [Playwright 測試報告文檔](https://playwright.dev/docs/test-reporters)
- [測試報告分析指南](./TEST_REPORT_ANALYSIS.md)
- [E2E 測試設定說明](./E2E_TEST_SETUP.md)

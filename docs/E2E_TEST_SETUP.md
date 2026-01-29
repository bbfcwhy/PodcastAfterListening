# E2E 測試設定說明

## 問題

執行 `npm run test:e2e` 時可能遇到以下錯誤：

```
⚠ Port 3000 is in use by process 11034, using available port 3001 instead.
⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

## 原因

這個錯誤通常發生在：
1. 已經有另一個 Next.js 開發伺服器正在運行（例如手動執行了 `npm run dev`）
2. 之前的測試沒有正確清理，留下了 lock 檔案

## 解決方案

### 方案 1：終止現有的開發伺服器（推薦）

在執行測試前，先終止所有正在運行的 Next.js 開發伺服器：

```bash
# 終止佔用 port 3000 的進程
lsof -ti:3000 | xargs kill -9

# 或者終止所有 Next.js 進程
pkill -f "next dev"
```

### 方案 2：清理 lock 檔案

如果進程已經終止但 lock 檔案還在：

```bash
rm -f .next/dev/lock
```

### 方案 3：使用現有伺服器

Playwright 配置已設定 `reuseExistingServer: !process.env.CI`，這表示：
- 在非 CI 環境中，如果已經有伺服器在運行，會直接使用它
- 在 CI 環境中，會強制啟動新的伺服器

如果手動啟動了開發伺服器，Playwright 應該會自動使用它。

## Playwright 配置說明

```typescript
webServer: {
  command: "npm run dev",
  url: "http://localhost:3000",
  reuseExistingServer: !process.env.CI, // 非 CI 環境重用現有伺服器
  timeout: 120 * 1000,
}
```

## 最佳實踐

1. **執行測試前**：確保沒有其他開發伺服器正在運行
2. **測試後**：Playwright 會自動清理，但如果手動中斷測試，可能需要手動清理
3. **CI/CD**：在 CI 環境中，`reuseExistingServer` 會設為 `false`，確保每次測試都使用乾淨的環境

## 快速清理腳本

可以建立一個清理腳本：

```bash
#!/bin/bash
# scripts/cleanup-dev-server.sh

echo "Cleaning up Next.js dev server..."

# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Remove lock file
rm -f .next/dev/lock

echo "Cleanup complete!"
```

然後在執行測試前運行：

```bash
./scripts/cleanup-dev-server.sh && npm run test:e2e
```

# Lint 設定說明

## 為什麼不用 `next lint`？

Next.js 16 的 CLI 已**不再提供** `lint` 子命令。執行 `npx next lint` 或 `npm run lint`（若腳本為 `next lint`）時，Next 會把 `lint` 當成 default 命令（`dev`）的專案目錄參數，因此出現：

```text
Invalid project directory provided, no such directory: .../PodcastAfterListening/lint
```

這是 Next.js 16 的變更，不是專案設定錯誤。

## 目前做法

專案改為**直接使用 ESLint 9**，並採用 **flat config**（`eslint.config.mjs`）：

- 使用 `@eslint/js` 與 `typescript-eslint` 的 recommended 規則
- 僅對 `src/` 底下的 `.ts`、`.tsx` 做 lint
- 忽略 `node_modules/`、`.next/`、`ui_reference/` 等

執行方式：

```bash
npm run lint
```

等同於：

```bash
eslint src --max-warnings 0
```

## 若想用 Next 的 ESLint 規則

目前 `eslint-config-next` 在 ESLint 9 的 legacy 模式（`.eslintrc.json`）下會觸發 circular structure 錯誤，因此 flat config 暫未沿用 `next/core-web-vitals`。若之後 Next 或社群提供可用的 flat config，可再改回或合併 Next 專用規則。

## 檢查型別

型別檢查請用 TypeScript：

```bash
npx tsc --noEmit
```

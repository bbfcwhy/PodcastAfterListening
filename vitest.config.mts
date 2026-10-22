import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/db/**/*.test.ts", "tests/unit/**/*.test.ts"],
    // library-actions.test.ts 是 Jest 寫法，但專案沒有安裝 jest，另案處理
    exclude: [...configDefaults.exclude, "tests/unit/library-actions.test.ts"],
    // 每支資料庫測試都要開一個 PGlite 並套用 migration，第一次載入較慢
    testTimeout: 30_000,
  },
});

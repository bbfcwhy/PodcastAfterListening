-- 將所有 position 為 0 的記錄更新為 9999
-- 這確保未排序（預設）的節目會排在手動排序的節目（1, 2, 3...）之後
UPDATE shows SET position = 9999 WHERE position = 0;

-- 將 position 欄位的預設值更改為 9999
-- 這樣新創建的節目也會自動排到最後面
ALTER TABLE shows ALTER COLUMN position SET DEFAULT 9999;

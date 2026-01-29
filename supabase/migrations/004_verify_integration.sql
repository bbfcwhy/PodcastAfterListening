-- Verification Script: 驗證整合是否成功
-- 執行此腳本檢查所有表、欄位、索引、觸發器和函數是否正確建立

-- ============================================================================
-- 1. 檢查所有表是否存在
-- ============================================================================
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('shows', 'hosts', 'show_hosts', 'podcast_episodes', 
                        'tags', 'episode_tags', 'comments', 'profiles',
                        'affiliate_contents', 'episode_affiliates', 'affiliate_clicks')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('shows', 'hosts', 'show_hosts', 'podcast_episodes', 
                     'tags', 'episode_tags', 'comments', 'profiles',
                     'affiliate_contents', 'episode_affiliates', 'affiliate_clicks')
ORDER BY table_name;

-- ============================================================================
-- 2. 檢查 podcast_episodes 表的所有欄位
-- ============================================================================
SELECT 
  'podcast_episodes Columns' as check_type,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'episode_id', 'title', 'show_id', 'slug', 
                         'published_at', 'original_url', 'is_published',
                         'summary', 'ai_summary', 'reflection', 'host_notes',
                         'sponsorship_info', 'ai_sponsorship', 'duration_seconds',
                         'audio_file_url', 'srt_file_url', 'summary_doc_url',
                         'reflection_doc_url', 'processed_at', 'created_at', 'updated_at')
    THEN '✓ EXISTS'
    ELSE '?'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'podcast_episodes'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. 檢查關鍵索引是否存在
-- ============================================================================
SELECT 
  'Indexes Check' as check_type,
  indexname,
  CASE 
    WHEN indexname IN ('idx_shows_slug', 'idx_shows_name_search',
                       'idx_podcast_episodes_episode_id', 'idx_podcast_episodes_show_id',
                       'idx_podcast_episodes_slug', 'idx_podcast_episodes_fts',
                       'idx_podcast_episodes_is_published', 'idx_comments_episode_id',
                       'idx_comments_status', 'idx_affiliate_clicks_affiliate_id')
    THEN '✓ EXISTS'
    ELSE '?'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN ('idx_shows_slug', 'idx_shows_name_search',
                    'idx_podcast_episodes_episode_id', 'idx_podcast_episodes_show_id',
                    'idx_podcast_episodes_slug', 'idx_podcast_episodes_fts',
                    'idx_podcast_episodes_is_published', 'idx_comments_episode_id',
                    'idx_comments_status', 'idx_affiliate_clicks_affiliate_id')
ORDER BY indexname;

-- ============================================================================
-- 4. 檢查觸發器是否存在
-- ============================================================================
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  event_object_table,
  CASE 
    WHEN trigger_name IN ('update_podcast_episodes_updated_at', 
                          'sync_summary_trigger', 'sync_reflection_trigger',
                          'sync_sponsorship_trigger', 'episodes_insert',
                          'episodes_update', 'episodes_delete')
    THEN '✓ EXISTS'
    ELSE '?'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('update_podcast_episodes_updated_at', 
                       'sync_summary_trigger', 'sync_reflection_trigger',
                       'sync_sponsorship_trigger', 'episodes_insert',
                       'episodes_update', 'episodes_delete')
ORDER BY trigger_name;

-- ============================================================================
-- 5. 檢查函數是否存在
-- ============================================================================
SELECT 
  'Functions Check' as check_type,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IN ('search_episodes', 'check_spam', 
                           'get_episode_by_slugs', 'get_episodes_by_show',
                           'update_updated_at_column', 'sync_summary_to_ai_summary',
                           'sync_reflection_to_host_notes', 
                           'sync_sponsorship_info_to_ai_sponsorship',
                           'migrate_pal_data_to_frontend_fields')
    THEN '✓ EXISTS'
    ELSE '?'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('search_episodes', 'check_spam', 
                       'get_episode_by_slugs', 'get_episodes_by_show',
                       'update_updated_at_column', 'sync_summary_to_ai_summary',
                       'sync_reflection_to_host_notes', 
                       'sync_sponsorship_info_to_ai_sponsorship',
                       'migrate_pal_data_to_frontend_fields')
ORDER BY routine_name;

-- ============================================================================
-- 6. 檢查視圖是否存在
-- ============================================================================
SELECT 
  'Views Check' as check_type,
  table_name as view_name,
  CASE 
    WHEN table_name = 'episodes'
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'episodes';

-- ============================================================================
-- 7. 檢查 RLS 是否啟用
-- ============================================================================
SELECT 
  'RLS Check' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = true
    THEN '✓ ENABLED'
    ELSE '✗ DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('podcast_episodes', 'shows', 'comments', 'profiles',
                    'affiliate_contents', 'affiliate_clicks')
ORDER BY tablename;

-- ============================================================================
-- 8. 檢查外鍵約束
-- ============================================================================
SELECT 
  'Foreign Keys Check' as check_type,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✓ EXISTS' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('podcast_episodes', 'comments', 'episode_tags',
                        'episode_affiliates', 'affiliate_clicks', 'show_hosts')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 9. 測試 episodes 視圖
-- ============================================================================
SELECT 
  'episodes View Test' as check_type,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✓ WORKING'
    ELSE '✗ ERROR'
  END as status
FROM episodes;

-- ============================================================================
-- 10. 測試欄位同步（如果有資料）
-- ============================================================================
SELECT 
  'Data Sync Test' as check_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN summary IS NOT NULL AND ai_summary IS NULL THEN 1 END) as needs_sync_summary,
  COUNT(CASE WHEN reflection IS NOT NULL AND host_notes IS NULL THEN 1 END) as needs_sync_reflection,
  COUNT(CASE WHEN sponsorship_info IS NOT NULL AND ai_sponsorship IS NULL THEN 1 END) as needs_sync_sponsorship,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ NO DATA (OK)'
    WHEN COUNT(CASE WHEN summary IS NOT NULL AND ai_summary IS NULL THEN 1 END) = 0
     AND COUNT(CASE WHEN reflection IS NOT NULL AND host_notes IS NULL THEN 1 END) = 0
     AND COUNT(CASE WHEN sponsorship_info IS NOT NULL AND ai_sponsorship IS NULL THEN 1 END) = 0
    THEN '✓ SYNCED'
    ELSE '⚠ NEEDS SYNC'
  END as status
FROM podcast_episodes;

-- ============================================================================
-- 總結報告
-- ============================================================================
SELECT 
  '=== INTEGRATION VERIFICATION SUMMARY ===' as summary,
  'All checks completed. Review the results above.' as message;

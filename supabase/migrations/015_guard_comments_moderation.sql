-- ============================================================================
-- 015: 留言作者只能改留言內容，審核欄位只有管理員能改
-- ============================================================================
-- 問題：comments_update_owner_or_admin 允許作者更新自己留言的任何欄位，
--      所以作者可以把被管理員隱藏（hidden）或判成垃圾（spam）的留言改回 approved，
--      也可以改 spam_score。
-- 修法：BEFORE UPDATE trigger。呼叫者是 API 角色（anon、authenticated）且不是管理員時，
--      除了 content（與自動維護的 updated_at）以外，任何欄位有變動就拒絕（42501，API 會回 403）。
--      用「只准改 content」而不是「不准改 status」：以後新增欄位時預設也受保護。
--      service_role 與 postgres（SQL editor、migration）不受影響；管理員照常審核。
-- 對既有資料：只新增函式與 trigger，不修改任何資料列。
-- ============================================================================

CREATE OR REPLACE FUNCTION public.guard_comments_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- SECURITY INVOKER（預設），current_user 就是這次 API 請求的角色
  IF current_user IN ('anon', 'authenticated')
     AND (to_jsonb(NEW) - 'content' - 'updated_at')
         IS DISTINCT FROM (to_jsonb(OLD) - 'content' - 'updated_at')
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND is_admin = true
     )
  THEN
    RAISE EXCEPTION '一般會員只能修改留言內容'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_comments_moderation ON public.comments;
CREATE TRIGGER guard_comments_moderation
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_comments_moderation();

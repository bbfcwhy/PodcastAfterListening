-- ============================================================================
-- 014: 只有管理員可以變更 profiles.is_admin
-- ============================================================================
-- 問題：profiles_update_owner_or_admin 允許會員更新自己 profile 的任何欄位，
--      所以會員可以用公開的 anon key 打 API，把自己的 is_admin 改成 true。
-- 修法：BEFORE UPDATE trigger。呼叫者是 API 角色（anon、authenticated）且不是管理員時，
--      is_admin 有變動就拒絕（42501，API 會回 403）。
--      service_role 與 postgres（SQL editor、migration）不受影響；管理員仍可指派管理員。
-- 為什麼不用欄位權限：Supabase 預設把整張表授權給 authenticated，
--      只下 REVOKE UPDATE (is_admin) 拿不掉整張表的 UPDATE 權限，擋不住。
-- 對既有資料：只新增函式與 trigger，不修改任何資料列。
-- ============================================================================

CREATE OR REPLACE FUNCTION public.guard_profiles_is_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- SECURITY INVOKER（預設），current_user 就是這次 API 請求的角色
  IF current_user IN ('anon', 'authenticated')
     AND NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND is_admin = true
     )
  THEN
    RAISE EXCEPTION '只有管理員可以變更 is_admin'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profiles_is_admin ON public.profiles;
CREATE TRIGGER guard_profiles_is_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profiles_is_admin();

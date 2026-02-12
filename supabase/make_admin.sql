-- 將指定 Email 的使用者設定為 Admin
DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'bbfcwhy@gmail.com'; -- 您的 Email
BEGIN
    -- 從 auth.users 取得使用者 ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NOT NULL THEN
        -- 插入或更新 public.profiles
        INSERT INTO public.profiles (id, is_admin)
        VALUES (v_user_id, true)
        ON CONFLICT (id) DO UPDATE
        SET is_admin = true;
        
        RAISE NOTICE '已成功將使用者 % 設定為 Admin', v_email;
    ELSE
        RAISE NOTICE '找不到使用者 %', v_email;
    END IF;
END $$;

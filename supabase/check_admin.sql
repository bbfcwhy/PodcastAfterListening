
SELECT id, is_admin FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'bbfcwhy@gmail.com');

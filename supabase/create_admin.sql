-- ==============================================================================
-- TẠO HOẶC CẬP NHẬT TÀI KHOẢN ADMIN STUWORK
-- Email: admin@stuwork.vn
-- Mật khẩu: admin123
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid := '00000000-0000-4000-8000-000000000001';
  v_encrypted_pw text := crypt('admin123', gen_salt('bf'));
BEGIN
  -- 1. Tạo hoặc cập nhật tài khoản đăng nhập trong auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@stuwork.vn',
    v_encrypted_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Quản Trị Viên STUWORK","role":"admin"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = 'admin@stuwork.vn',
    encrypted_password = v_encrypted_pw,
    email_confirmed_at = NOW(),
    raw_user_meta_data = '{"full_name":"Quản Trị Viên STUWORK","role":"admin"}',
    updated_at = NOW();

  -- Đảm bảo nếu email đã có thì cập nhật mật khẩu mới
  UPDATE auth.users
  SET encrypted_password = v_encrypted_pw,
      email_confirmed_at = NOW()
  WHERE email = 'admin@stuwork.vn';

  -- 2. Cấp quyền quản trị viên Admin trong bảng profiles
  INSERT INTO public.profiles (
    id, email, full_name, role, phone, is_demo, created_at, updated_at
  )
  VALUES (
    v_user_id, 'admin@stuwork.vn', 'Quản Trị Viên STUWORK', 'admin', '0900000001', FALSE, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = 'admin@stuwork.vn',
    role = 'admin',
    full_name = 'Quản Trị Viên STUWORK',
    updated_at = NOW();

  -- 3. Dọn dẹp liên kết con
  DELETE FROM public.student_profiles WHERE user_id = v_user_id;
  DELETE FROM public.employer_profiles WHERE user_id = v_user_id;

END $$;

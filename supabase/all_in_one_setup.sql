-- ==============================================================================
-- STUWORK - MIGRATION 00001: INITIAL DATABASE SCHEMA (11 TABLES, INDEXES, TRIGGERS)
-- Hệ quản trị: Supabase PostgreSQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. BẢNG profiles (Liên kết trực tiếp với auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'employer', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BẢNG student_profiles (Hồ sơ chi tiết của sinh viên)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  university TEXT,
  major TEXT,
  year_of_study INTEGER CHECK (year_of_study IS NULL OR (year_of_study >= 1 AND year_of_study <= 8)),
  location TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience TEXT,
  desired_job_title TEXT,
  desired_salary NUMERIC(12, 0),
  availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  cv_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. BẢNG employer_profiles (Hồ sơ doanh nghiệp / cửa hàng tuyển dụng)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  address TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  founded_info TEXT,
  logo_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'not_submitted'
    CHECK (verification_status IN ('not_submitted', 'pending', 'verified', 'rejected', 'suspended')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BẢNG jobs (Tin tuyển dụng việc làm)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  benefits TEXT NOT NULL,
  category TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('Part-time', 'Full-time', 'Freelance', 'Remote', 'Internship')),
  salary_min NUMERIC(12, 0),
  salary_max NUMERIC(12, 0),
  salary_unit TEXT NOT NULL DEFAULT 'hour' CHECK (salary_unit IN ('hour', 'day', 'month', 'project')),
  location TEXT NOT NULL,
  work_mode TEXT NOT NULL DEFAULT 'Onsite' CHECK (work_mode IN ('Onsite', 'Remote', 'Hybrid')),
  working_time TEXT NOT NULL,
  vacancies INTEGER NOT NULL DEFAULT 1 CHECK (vacancies >= 1),
  deadline DATE,
  contact_info TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'active', 'closed', 'rejected')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BẢNG applications (Đơn ứng tuyển của sinh viên)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  relevant_experience TEXT,
  available_time TEXT,
  cv_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  employer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_applications_job_student UNIQUE (job_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 6. BẢNG saved_jobs (Công việc yêu thích đã lưu)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_jobs_student_job UNIQUE (student_id, job_id)
);

-- ------------------------------------------------------------------------------
-- 7. BẢNG job_reports (Báo cáo tin tuyển dụng đáng ngờ / vi phạm)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. BẢNG verification_requests (Yêu cầu xác minh nhà tuyển dụng)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  representative_name TEXT NOT NULL,
  address TEXT,
  tax_code TEXT,
  website TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. BẢNG reviews (Đánh giá công việc sau khi được chấp nhận & hoàn thành)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_reviews_job_student UNIQUE (job_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 10. BẢNG notifications (Thông báo trong ứng dụng)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. BẢNG admin_logs (Nhật ký thao tác quản trị viên)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- CHỈ MỤC TỐI ƯU TRUY VẤN (INDEXES)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON public.employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_verification ON public.employer_profiles(verification_status);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_student_id ON public.saved_jobs(student_id);
CREATE INDEX IF NOT EXISTS idx_job_reports_status ON public.job_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- TRIGGERS CẬP NHẬT updated_at & ĐỒNG BỘ TÀI KHOẢN ĐĂNG KÝ AN TOÀN
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_employer_profiles_updated_at ON public.employer_profiles;
CREATE TRIGGER trg_employer_profiles_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger tạo hồ sơ tự động khi đăng ký qua Supabase Auth.
-- BẢO MẬT QUAN TRỌNG: Tuyệt đối KHÔNG cho phép người dùng tự truyền role = 'admin' từ client!
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_safe_role TEXT;
  v_full_name TEXT;
  v_is_demo BOOLEAN;
BEGIN
  -- Chỉ chấp nhận 'employer' hoặc mặc định là 'student'. Mọi giá trị 'admin' từ client đều bị ép về 'student'.
  IF (NEW.raw_user_meta_data ->> 'role') = 'employer' THEN
    v_safe_role := 'employer';
  ELSE
    v_safe_role := 'student';
  END IF;

  v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(NEW.email, '@', 1));
  v_is_demo := COALESCE((NEW.raw_user_meta_data ->> 'is_demo')::boolean, FALSE);

  INSERT INTO public.profiles (id, full_name, email, role, is_active, is_demo)
  VALUES (NEW.id, v_full_name, NEW.email, v_safe_role, TRUE, v_is_demo)
  ON CONFLICT (id) DO NOTHING;

  IF v_safe_role = 'student' THEN
    INSERT INTO public.student_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_safe_role = 'employer' THEN
    INSERT INTO public.employer_profiles (user_id, company_name, contact_email, verification_status, is_demo)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'company_name'), ''), v_full_name),
      NEW.email,
      'not_submitted',
      v_is_demo
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ==============================================================================
-- STUWORK - MIGRATION 00002: ROW LEVEL SECURITY (RLS) & SUPABASE STORAGE BUCKETS
-- Bật RLS trên toàn bộ 11 bảng và 4 bucket lưu trữ theo nguyên tắc phân quyền chặt chẽ
-- ==============================================================================

-- Cấp quyền truy cập Data API cơ bản (kết hợp bắt buộc với RLS bên dưới)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.employer_profiles, public.jobs, public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ------------------------------------------------------------------------------
-- BẬT RLS CHO TẤT CẢ 11 BẢNG
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- SCHEMA NỘI BỘ CHO HÀM KIỂM TRA QUYỀN (Tránh lộ hàm SECURITY DEFINER ra public)
-- ------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app_security;
GRANT USAGE ON SCHEMA app_security TO authenticated, anon;

CREATE OR REPLACE FUNCTION app_security.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
      AND p.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION app_security.current_employer_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ep.id
  FROM public.employer_profiles ep
  JOIN public.profiles p ON p.id = ep.user_id
  WHERE ep.user_id = (SELECT auth.uid())
    AND p.is_active = TRUE
  LIMIT 1;
$$;

-- ------------------------------------------------------------------------------
-- 1. POLICIES CHO BẢNG profiles
-- Bảo vệ quyền riêng tư: Sinh viên không lộ SĐT/Email công khai; chỉ chính chủ,
-- nhà tuyển dụng có đơn ứng tuyển của sinh viên đó, hoặc Admin mới đọc được.
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select_own_or_authorized"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR app_security.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.student_id = profiles.id
        AND j.employer_id = app_security.current_employer_id()
    )
  );

-- Người dùng chỉ sửa thông tin cá nhân của chính mình, KHÔNG được tự đổi role hay is_active
CREATE POLICY "profiles_update_own_safe"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()) AND is_active = TRUE)
  WITH CHECK (
    id = (SELECT auth.uid())
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

CREATE POLICY "profiles_admin_update_all"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 2. POLICIES CHO BẢNG student_profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "student_profiles_select_authorized"
  ON public.student_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR app_security.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.student_id = student_profiles.user_id
        AND j.employer_id = app_security.current_employer_id()
    )
  );

CREATE POLICY "student_profiles_insert_own"
  ON public.student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "student_profiles_update_own"
  ON public.student_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. POLICIES CHO BẢNG employer_profiles
-- Thông tin đơn vị tuyển dụng là công khai để sinh viên kiểm tra tính minh bạch;
-- Nhà tuyển dụng KHÔNG ĐƯỢC tự sửa verification_status.
-- ------------------------------------------------------------------------------
CREATE POLICY "employer_profiles_public_read"
  ON public.employer_profiles FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "employer_profiles_insert_own"
  ON public.employer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND verification_status = 'not_submitted'
  );

CREATE POLICY "employer_profiles_update_own_no_verify_tamper"
  ON public.employer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND verification_status = (
      SELECT ep.verification_status
      FROM public.employer_profiles ep
      WHERE ep.id = employer_profiles.id
    )
  );

CREATE POLICY "employer_profiles_admin_manage"
  ON public.employer_profiles FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 4. POLICIES CHO BẢNG jobs
-- Khách chỉ xem tin active; NTD xem toàn bộ tin của mình & chỉ xuất bản active khi đã verified
-- ------------------------------------------------------------------------------
CREATE POLICY "jobs_public_read_active"
  ON public.jobs FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'
    OR employer_id = app_security.current_employer_id()
    OR app_security.is_admin()
  );

CREATE POLICY "jobs_employer_insert"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id = app_security.current_employer_id()
    AND (
      status IN ('draft', 'pending')
      OR (
        status = 'active'
        AND EXISTS (
          SELECT 1 FROM public.employer_profiles ep
          WHERE ep.id = jobs.employer_id AND ep.verification_status = 'verified'
        )
      )
    )
  );

CREATE POLICY "jobs_employer_update_own"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (employer_id = app_security.current_employer_id())
  WITH CHECK (
    employer_id = app_security.current_employer_id()
    AND (
      status IN ('draft', 'pending', 'closed')
      OR (
        status = 'active'
        AND EXISTS (
          SELECT 1 FROM public.employer_profiles ep
          WHERE ep.id = jobs.employer_id AND ep.verification_status = 'verified'
        )
      )
    )
  );

CREATE POLICY "jobs_admin_manage"
  ON public.jobs FOR ALL
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 5. POLICIES CHO BẢNG applications
-- ------------------------------------------------------------------------------
CREATE POLICY "applications_select_own_or_job_employer_or_admin"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id
        AND j.employer_id = app_security.current_employer_id()
    )
    OR app_security.is_admin()
  );

CREATE POLICY "applications_student_insert"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = (SELECT auth.uid())
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'student' AND p.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id
        AND j.status = 'active'
        AND (j.deadline IS NULL OR j.deadline >= CURRENT_DATE)
    )
  );

-- Sinh viên chỉ được rút hồ sơ (withdrawn) khi đơn đang pending/reviewed
CREATE POLICY "applications_student_withdraw"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (student_id = (SELECT auth.uid()) AND status IN ('pending', 'reviewed'))
  WITH CHECK (student_id = (SELECT auth.uid()) AND status = 'withdrawn');

-- Nhà tuyển dụng cập nhật trạng thái & ghi chú cho ứng viên thuộc tin của mình
CREATE POLICY "applications_employer_update"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id
        AND j.employer_id = app_security.current_employer_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id
        AND j.employer_id = app_security.current_employer_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 6. POLICIES CHO BẢNG saved_jobs
-- ------------------------------------------------------------------------------
CREATE POLICY "saved_jobs_student_manage_own"
  ON public.saved_jobs FOR ALL
  TO authenticated
  USING (student_id = (SELECT auth.uid()))
  WITH CHECK (student_id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 7. POLICIES CHO BẢNG job_reports
-- ------------------------------------------------------------------------------
CREATE POLICY "job_reports_insert_authenticated"
  ON public.job_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()) AND status = 'pending');

CREATE POLICY "job_reports_select_own_or_admin"
  ON public.job_reports FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()) OR app_security.is_admin());

CREATE POLICY "job_reports_admin_update"
  ON public.job_reports FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 8. POLICIES CHO BẢNG verification_requests
-- ------------------------------------------------------------------------------
CREATE POLICY "verification_requests_select_own_or_admin"
  ON public.verification_requests FOR SELECT
  TO authenticated
  USING (
    employer_id = app_security.current_employer_id()
    OR app_security.is_admin()
  );

CREATE POLICY "verification_requests_employer_insert"
  ON public.verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id = app_security.current_employer_id()
    AND status = 'pending'
  );

CREATE POLICY "verification_requests_admin_update"
  ON public.verification_requests FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 9. POLICIES CHO BẢNG reviews
-- Chỉ sinh viên đã có đơn ứng tuyển được chấp nhận (accepted) mới được đánh giá
-- ------------------------------------------------------------------------------
CREATE POLICY "reviews_public_read"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "reviews_student_insert_eligible"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.job_id = reviews.job_id
        AND a.student_id = (SELECT auth.uid())
        AND a.status = 'accepted'
    )
  );

-- ------------------------------------------------------------------------------
-- 10. POLICIES CHO BẢNG notifications
-- ------------------------------------------------------------------------------
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_update_own_read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- 11. POLICIES CHO BẢNG admin_logs
-- ------------------------------------------------------------------------------
CREATE POLICY "admin_logs_admin_only"
  ON public.admin_logs FOR ALL
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin() AND admin_id = (SELECT auth.uid()));

-- ==============================================================================
-- SUPABASE STORAGE: 4 BUCKETS & PHÂN QUYỀN TỆP TIN RIÊNG TƯ
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', TRUE, 3145728, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('company-logos', 'company-logos', TRUE, 3145728, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('student-cvs', 'student-cvs', FALSE, 5242880, ARRAY['application/pdf']),
  ('verification-documents', 'verification-documents', FALSE, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public Buckets: avatars & company-logos (thư mục gốc theo auth.uid())
CREATE POLICY "public_avatars_logos_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('avatars', 'company-logos'));

CREATE POLICY "public_avatars_logos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "public_avatars_logos_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "public_avatars_logos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Private Bucket: student-cvs (Chủ sở hữu, NTD có đơn ứng tuyển hợp lệ, hoặc Admin)
CREATE POLICY "student_cvs_select_authorized"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'student-cvs'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR app_security.is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        WHERE a.student_id::text = (storage.foldername(name))[1]
          AND j.employer_id = app_security.current_employer_id()
      )
    )
  );

CREATE POLICY "student_cvs_write_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "student_cvs_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "student_cvs_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Private Bucket: verification-documents (Chủ sở hữu NTD và Admin)
CREATE POLICY "verification_docs_select_authorized"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR app_security.is_admin()
    )
  );

CREATE POLICY "verification_docs_write_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "verification_docs_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );


-- ==============================================================================
-- STUWORK - IDEMPOTENT DEMO SEED DATA (supabase/seed.sql)
-- Chạy an toàn nhiều lần không gây trùng lặp (ON CONFLICT DO UPDATE / DO NOTHING)
-- BẢO MẬT: Các bản ghi auth.users demo có encrypted_password = '' (KHÔNG thể đăng
-- nhập bằng mật khẩu cố định công khai trên môi trường Production).
-- Tất cả bản ghi đều được đánh dấu is_demo = TRUE và thông tin liên hệ giả lập.
-- ==============================================================================

BEGIN;

-- 1. Khởi tạo bản ghi auth.users khóa mật khẩu cho các hồ sơ minh họa (thỏa khóa ngoại)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ban Quản Trị STUWORK (Demo)","is_demo":true}', NOW(), NOW()),
  -- 8 Nhà tuyển dụng Demo
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr.cafemoc@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nguyễn Thành Trung","role":"employer","company_name":"Cafe Mộc Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tuyendung.hoctot@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Trần Thanh Hương","role":"employer","company_name":"Trung tâm Học Tốt Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'talent.medialab@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lê Hoàng Bách","role":"employer","company_name":"Media Lab Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr.localstore@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Phạm Mai Phương","role":"employer","company_name":"Local Store Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'careers.eduplus@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Đinh Quốc Việt","role":"employer","company_name":"EduPlus Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'people.techstart@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Võ Minh Khôi","role":"employer","company_name":"TechStart Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr.freshfood@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hoàng Thu Trang","role":"employer","company_name":"Fresh Food Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hello.creativestudio@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lý Gia Hân","role":"employer","company_name":"Creative Studio Demo","is_demo":true}', NOW(), NOW()),
  -- 10 Sinh viên Demo
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'minhanh.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nguyễn Minh Anh","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ducminh.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Trần Đức Minh","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'thuha.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lê Thu Hà","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'quanghuy.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Phạm Quang Huy","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ngoclinh.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hoàng Ngọc Linh","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hainam.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vũ Hải Nam","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'phuongthao.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Đặng Phương Thảo","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tuankiet.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bùi Tuấn Kiệt","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'khanhvy.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ngô Khánh Vy","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'giabao.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Đỗ Gia Bảo","role":"student","is_demo":true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Đảm bảo tài khoản quản trị minh họa mang role = 'admin' từ phía server SQL
UPDATE public.profiles
SET role = 'admin', full_name = 'Ban Quản Trị STUWORK (Demo)', phone = '0900000001', is_demo = TRUE
WHERE id = '00000000-0000-4000-8000-000000000001';

DELETE FROM public.student_profiles WHERE user_id = '00000000-0000-4000-8000-000000000001';

-- 2. Đồng bộ 8 Hồ sơ Nhà tuyển dụng Demo
INSERT INTO public.employer_profiles (
  id, user_id, company_name, description, industry, address, website,
  contact_email, contact_phone, founded_info, verification_status, is_demo
)
VALUES
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Cafe Mộc Demo', 'Không gian cà phê sách và đồ uống thủ công dành cho giới trẻ tại Hà Nội. Môi trường thân thiện, linh hoạt xoay ca theo lịch học sinh viên.', 'F&B – Chuỗi đồ uống', 'Số 42 Trần Thái Tông, Cầu Giấy, Hà Nội (Địa chỉ giả lập)', 'https://cafemoc.demo.stuwork.vn', 'hr.cafemoc@demo.stuwork.vn', '0900100001', 'Hoạt động 3 năm (Mô hình Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Trung tâm Học Tốt Demo', 'Đơn vị bồi dưỡng kiến thức Toán – Tiếng Anh – Khoa học tự nhiên cho học sinh THCS & THPT.', 'Giáo dục & Đào tạo', 'Số 118 Nguyễn Trãi, Thanh Xuân, Hà Nội (Địa chỉ giả lập)', 'https://hoctot.demo.stuwork.vn', 'tuyendung.hoctot@demo.stuwork.vn', '0900100002', 'Hoạt động 5 năm (Mô hình Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Media Lab Demo', 'Agency sáng tạo nội dung số, sản xuất bài viết SEO, kịch bản video ngắn và chiến dịch truyền thông.', 'Truyền thông & Nội dung số', 'Tầng 5, Tòa nhà Sáng Tạo, Quận 3, TP. Hồ Chí Minh (Địa chỉ giả lập)', 'https://medialab.demo.stuwork.vn', 'talent.medialab@demo.stuwork.vn', '0900100003', 'Hoạt động 4 năm (Mô hình Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'Local Store Demo', 'Cửa hàng phụ kiện, văn phòng phẩm và quà tặng thiết kế tối giản dành cho học sinh – sinh viên.', 'Bán lẻ & Thời trang', 'Số 85 Chùa Bộc, Đống Đa, Hà Nội (Địa chỉ giả lập)', 'https://localstore.demo.stuwork.vn', 'hr.localstore@demo.stuwork.vn', '0900100004', 'Hoạt động 2 năm (Mô hình Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'EduPlus Demo', 'Nền tảng học tiếng Anh giao tiếp và luyện thi chứng chỉ quốc tế kết hợp trực tiếp và trực tuyến.', 'Công nghệ Giáo dục (EdTech)', 'Số 210 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh (Địa chỉ giả lập)', 'https://eduplus.demo.stuwork.vn', 'careers.eduplus@demo.stuwork.vn', '0900100005', 'Hoạt động 4 năm (Mô hình Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', 'TechStart Demo', 'Startup phát triển phần mềm SaaS quản lý bán hàng và ứng dụng di động dành cho doanh nghiệp vừa và nhỏ.', 'Công nghệ thông tin & Phần mềm', 'Khu Công nghệ Phần mềm, Hải Châu, Đà Nẵng (Địa chỉ giả lập)', 'https://techstart.demo.stuwork.vn', 'people.techstart@demo.stuwork.vn', '0900100006', 'Hoạt động 3 năm (Mô hình Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000007', 'Fresh Food Demo', 'Hệ thống cửa hàng thực phẩm sạch, salad và đồ ăn lành mạnh giao nhanh nội thành.', 'Thực phẩm sạch & Bán lẻ', 'Số 56 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh (Địa chỉ giả lập)', 'https://freshfood.demo.stuwork.vn', 'hr.freshfood@demo.stuwork.vn', '0900100007', 'Hoạt động 2 năm (Mô hình Demo)', 'pending', TRUE),
  ('11000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000008', 'Creative Studio Demo', 'Xưởng thiết kế nhận diện thương hiệu, minh họa 2D và sản xuất ấn phẩm sự kiện trẻ trung.', 'Thiết kế Sáng tạo', 'Số 19 Tô Ngọc Vân, Tây Hồ, Hà Nội (Địa chỉ giả lập)', 'https://creativestudio.demo.stuwork.vn', 'hello.creativestudio@demo.stuwork.vn', '0900100008', 'Hoạt động 3 năm (Mô hình Demo)', 'verified', TRUE)
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  industry = EXCLUDED.industry,
  address = EXCLUDED.address,
  website = EXCLUDED.website,
  verification_status = EXCLUDED.verification_status,
  is_demo = TRUE;

-- 3. Cập nhật chi tiết 10 Hồ sơ Sinh viên Demo
INSERT INTO public.student_profiles (user_id, university, major, year_of_study, location, bio, skills, experience, desired_job_title, desired_salary, availability)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'Trường Đại học Kinh tế Quốc dân (Demo)', 'Marketing', 3, 'Hà Nội', 'Sinh viên năm 3 chuyên ngành Marketing số, yêu thích viết lách và quản trị fanpage.', ARRAY['Viết nội dung','Canva','Marketing','Quản trị Fanpage'], '6 tháng làm CTV nội dung cho CLB Truyền thông.', 'CTV Content Marketing', 35000, '{"shifts":["Ca tối","Linh hoạt","Cuối tuần"],"days":["T2","T4","T6","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000002', 'Đại học Bách khoa Hà Nội (Demo)', 'Công nghệ thông tin', 3, 'Hà Nội', 'Sinh viên CNTT nắm vững React, TypeScript, SQL và Toán THPT.', ARRAY['React','TypeScript','HTML/CSS','Gia sư Toán'], 'Đã xây dựng 2 website môn học và kèm Toán lớp 9.', 'Thực tập sinh Frontend / Gia sư Toán', 45000, '{"shifts":["Ca chiều","Ca tối"],"days":["T3","T5","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000003', 'Trường Đại học Ngoại ngữ (Demo)', 'Ngôn ngữ Anh', 2, 'Hà Nội', 'Năng động, IELTS 7.5, yêu thích giảng dạy thiếu nhi.', ARRAY['Tiếng Anh IELTS 7.5','Trợ giảng','Giao tiếp'], 'Trợ giảng lớp giao tiếp thiếu nhi 4 tháng.', 'Trợ giảng Tiếng Anh', 40000, '{"shifts":["Ca tối","Cuối tuần"],"days":["T2","T4","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000004', 'Trường Đại học Thương mại (Demo)', 'Kinh tế đối ngoại', 2, 'Hà Nội', 'Nhanh nhẹn, trung thực, giao tiếp thân thiện.', ARRAY['Bán hàng','Thu ngân','Chăm sóc khách hàng'], 'Nhân viên bán hàng part-time 3 tháng.', 'Nhân viên bán hàng', 30000, '{"shifts":["Ca sáng","Cuối tuần"],"days":["T2","T3","T6","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000005', 'Trường Đại học Kiến trúc (Demo)', 'Thiết kế đồ họa', 3, 'TP. Hồ Chí Minh', 'Đam mê thiết kế banner mạng xã hội và nhận diện thương hiệu.', ARRAY['Photoshop','Illustrator','Figma','Thiết kế đồ họa'], 'Freelance thiết kế cho 5 fanpage ẩm thực.', 'Thiết kế đồ họa Part-time', 45000, '{"shifts":["Linh hoạt","Ca tối"],"days":["T2","T3","T4","T5","T6"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000006', 'Trường Đại học Bách khoa Đà Nẵng (Demo)', 'Kỹ thuật phần mềm', 4, 'Đà Nẵng', 'Tư duy logic tốt, yêu thích kiểm thử phần mềm QA/Tester.', ARRAY['Kiểm thử phần mềm','SQL','JavaScript'], 'Thực tập QA nội bộ tại phòng lab 3 tháng.', 'Thực tập sinh Tester', 35000, '{"shifts":["Ca sáng","Ca chiều"],"days":["T2","T4","T6"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000007', 'Trường Đại học KHXH & Nhân văn (Demo)', 'Báo chí – Truyền thông', 2, 'TP. Hồ Chí Minh', 'Biên tập tiếng Việt mạch lạc, bắt nhịp xu hướng văn minh.', ARRAY['Biên tập bài viết','SEO cơ bản','Kịch bản TikTok'], 'CTV bản tin sinh viên.', 'CTV Viết bài', 30000, '{"shifts":["Linh hoạt"],"days":["T2","T3","T5","T7"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000008', 'Trường Đại học Ngân hàng TP.HCM (Demo)', 'Tài chính – Ngân hàng', 1, 'TP. Hồ Chí Minh', 'Chăm chỉ, đúng giờ, muốn trải nghiệm pha chế & phục vụ.', ARRAY['Phục vụ','Pha chế cơ bản','Thu ngân'], 'Hậu cần ngày hội tân sinh viên.', 'Nhân viên phục vụ / Pha chế', 26000, '{"shifts":["Ca chiều","Cuối tuần"],"days":["T4","T6","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000009', 'Trường Đại học Sư phạm Đà Nẵng (Demo)', 'Sư phạm Toán', 3, 'Đà Nẵng', 'Kiên nhẫn, có phương pháp dạy học sinh lấy lại gốc môn Toán.', ARRAY['Gia sư Toán','Sư phạm','Soạn đề ôn tập'], 'Gia sư Toán lớp 7–8 trong 1.5 năm.', 'Gia sư Toán THCS', 50000, '{"shifts":["Ca tối","Cuối tuần"],"days":["T3","T5","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000010', 'Học viện Công nghệ Bưu chính Viễn thông (Demo)', 'Thương mại điện tử', 2, 'Hà Nội', 'Thành thạo Google Sheets và chăm sóc khách hàng TMĐT.', ARRAY['Nhập liệu','Google Sheets','Chăm sóc khách hàng'], 'Hỗ trợ trực gian hàng sách trực tuyến 4 tháng.', 'CTV Nhập liệu / Trực Page', 28000, '{"shifts":["Ca tối","Linh hoạt"],"days":["T2","T3","T4","T5","CN"]}'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET
  university = EXCLUDED.university,
  major = EXCLUDED.major,
  year_of_study = EXCLUDED.year_of_study,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  skills = EXCLUDED.skills,
  experience = EXCLUDED.experience,
  desired_job_title = EXCLUDED.desired_job_title,
  desired_salary = EXCLUDED.desired_salary,
  availability = EXCLUDED.availability;

-- 4. Chèn 32 Công việc Demo (31 active + 1 pending của NTD chờ xác minh)
INSERT INTO public.jobs (
  id, employer_id, title, slug, description, requirements, benefits,
  category, job_type, salary_min, salary_max, salary_unit,
  location, work_mode, working_time, vacancies, deadline, contact_info, views_count, status, is_demo
)
VALUES
  ('30000000-0000-4000-8000-000000000001', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'Nhân viên phục vụ quán cafe', 'demo-viec-lam-1', 'Đón tiếp khách hàng, giới thiệu menu đồ uống, bưng bê phục vụ tại bàn và giữ gìn không gian quán sạch sẽ.', 'Sinh viên từ 18 tuổi, giao tiếp thân thiện, đúng giờ, có trách nhiệm. Đăng ký tối thiểu 4 ca/tuần.', 'Được hướng dẫn công việc từ đầu, hỗ trợ 1 đồ uống mỗi ca, xoay ca linh hoạt theo lịch thi.', 'Phục vụ', 'Part-time', 25000, 30000, 'hour', 'Cầu Giấy, Hà Nội', 'Onsite', 'Ca sáng hoặc Ca tối', 4, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 120, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000002', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 'Gia sư Toán cấp 2', 'demo-viec-lam-2', 'Kèm 1-1 hoặc nhóm nhỏ môn Toán lớp 7–9 theo khung chương trình chuẩn của Trung tâm Học Tốt Demo.', 'Nắm vững kiến thức Toán cấp 2, kiên nhẫn, diễn đạt mạch lạc.', 'Chủ động lịch dạy, có sẵn giáo án chuẩn hóa, không thu phí nhận lớp.', 'Gia sư', 'Part-time', 120000, 180000, 'day', 'Thanh Xuân, Hà Nội', 'Onsite', 'Ca tối (18h30–20h30)', 3, '2027-03-31', 'tuyendung.hoctot@demo.stuwork.vn', 145, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000003', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Cộng tác viên viết nội dung chuẩn SEO', 'demo-viec-lam-3', 'Viết bài chia sẻ kiến thức học tập, đời sống sinh viên và giới thiệu sản phẩm công nghệ (800–1.200 từ/bài).', 'Viết tiếng Việt tốt, không sao chép nội dung, đảm bảo 3–5 bài/tuần.', 'Làm việc từ xa 100%, được hướng dẫn SEO thực chiến, xét tăng nhuận bút sau 15 bài.', 'Marketing', 'Freelance', 80000, 150000, 'project', 'Làm việc từ xa', 'Remote', 'Linh hoạt', 5, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 210, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000004', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'Nhân viên bán hàng cuối tuần', 'demo-viec-lam-4', 'Tư vấn khách chọn sổ tay, phụ kiện bàn học, gói quà tặng tại cửa hàng Local Store Demo.', 'Giao tiếp tốt, trung thực, làm việc Thứ 7 và Chủ nhật.', 'Thưởng doanh số tuần, ưu đãi nhân viên 25%, môi trường trẻ trung.', 'Bán hàng', 'Part-time', 30000, 35000, 'hour', 'Đống Đa, Hà Nội', 'Onsite', 'Cuối tuần', 3, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 98, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000005', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Trợ giảng Tiếng Anh giao tiếp thiếu nhi', 'demo-viec-lam-5', 'Hỗ trợ giảng viên nước ngoài quản lý lớp học 12–15 bé, hướng dẫn hoạt động nhóm.', 'Tiếng Anh giao tiếp khá (IELTS 6.0+), yêu trẻ, năng động.', 'Rèn phản xạ tiếng Anh mỗi ngày, cấp chứng nhận trợ giảng sau 6 tháng.', 'Gia sư', 'Part-time', 38000, 50000, 'hour', 'Bình Thạnh, TP. Hồ Chí Minh', 'Onsite', 'Ca tối & Cuối tuần', 4, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 134, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000006', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Thực tập sinh Frontend Next.js / React', 'demo-viec-lam-6', 'Tham gia phát triển giao diện module báo cáo cho nền tảng SaaS bằng React, Next.js và Tailwind CSS.', 'Sinh viên năm 3–4 ngành CNTT, nắm vững HTML/CSS, TypeScript cơ bản và Git.', 'Trợ cấp thực tập hàng tháng, review code 1-1, hỗ trợ số liệu báo cáo tốt nghiệp.', 'Công nghệ', 'Internship', 3500000, 5000000, 'month', 'Hải Châu, Đà Nẵng', 'Hybrid', 'Ca sáng hoặc Ca chiều', 2, '2027-03-31', 'people.techstart@demo.stuwork.vn', 176, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000007', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Thiết kế đồ họa Social Media (Part-time)', 'demo-viec-lam-7', 'Thiết kế bộ ảnh bài đăng Facebook/Instagram, banner chiến dịch và standee sự kiện.', 'Sử dụng tốt Illustrator, Photoshop hoặc Figma; có Portfolio cơ bản.', 'Được Art Director hướng dẫn bố cục, trả lương theo giờ rõ ràng.', 'Thiết kế', 'Freelance', 40000, 55000, 'hour', 'Tây Hồ, Hà Nội', 'Hybrid', 'Linh hoạt', 2, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 112, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000008', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'Nhân viên pha chế (Barista Part-time)', 'demo-viec-lam-8', 'Pha chế cà phê máy, trà trái cây theo công thức định lượng chuẩn của Cafe Mộc Demo.', 'Sạch sẽ, tỉ mỉ. Chưa có kinh nghiệm được đào tạo trong 5 buổi đầu vẫn có phụ cấp.', 'Đào tạo Barista miễn phí, xét tăng bậc lương sau mỗi 3 tháng.', 'Phục vụ', 'Part-time', 28000, 35000, 'hour', 'Cầu Giấy, Hà Nội', 'Onsite', 'Ca sáng hoặc Ca chiều', 2, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 89, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000009', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Chăm sóc học viên trực tuyến (CSKH Online)', 'demo-viec-lam-9', 'Giải đáp thắc mắc lịch học, hỗ trợ kỹ thuật Zoom và nhắc lịch kiểm tra định kỳ.', 'Có máy tính cá nhân, mạng ổn định, giao tiếp lịch sự.', 'Làm việc tại nhà an toàn, không áp doanh số bán hàng.', 'Chăm sóc khách hàng', 'Remote', 26000, 32000, 'hour', 'Làm việc từ xa', 'Remote', 'Ca tối (18h00–22h00)', 4, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 154, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000010', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'Nhân viên đóng gói đơn hàng sách & quà tặng', 'demo-viec-lam-10', 'Kiểm tra sản phẩm theo phiếu đơn TMĐT, bọc chống sốc cẩn thận và dán mã vận đơn.', 'Cẩn thận, trung thực, không yêu cầu kinh nghiệm.', 'Kho hàng điều hòa mát mẻ, thanh toán lương 2 tuần/lần.', 'Bán hàng', 'Part-time', 26000, 30000, 'hour', 'Đống Đa, Hà Nội', 'Onsite', 'Ca chiều (13h30–17h30)', 3, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 76, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000011', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Cộng tác viên nhập liệu & chuẩn hóa danh mục', 'demo-viec-lam-11', 'Kiểm tra chính tả, phân loại thẻ danh mục sản phẩm mẫu và chuẩn hóa bảng biểu.', 'Thành thạo Excel / Google Sheets cơ bản, tỉ mỉ, bảo mật dữ liệu.', 'Hoàn toàn không thu phí hay đặt cọc, ký thỏa thuận CTV minh bạch.', 'Cộng tác viên', 'Remote', 25000, 30000, 'hour', 'Làm việc từ xa', 'Remote', 'Linh hoạt', 6, '2027-03-31', 'people.techstart@demo.stuwork.vn', 198, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000012', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Thực tập sinh Marketing mạng xã hội', 'demo-viec-lam-12', 'Lên lịch nội dung tuần, phối hợp Designer sản xuất bài đăng tương tác và báo cáo chỉ số.', 'Sinh viên chuyên ngành Marketing, Truyền thông; sáng tạo, chủ động.', 'Tham gia dự án thực tế, hỗ trợ gửi xe và phụ cấp ăn trưa.', 'Marketing', 'Internship', 3000000, 4500000, 'month', 'Quận 3, TP. Hồ Chí Minh', 'Hybrid', 'Ca sáng & Ca chiều linh hoạt', 3, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 142, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000013', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 'Gia sư Tiếng Anh lớp 6 – lớp 8', 'demo-viec-lam-13', 'Hướng dẫn ngữ pháp trọng tâm và luyện phát âm cho học sinh THCS tại khu vực Cầu Giấy.', 'Phát âm chuẩn, nắm chắc ngữ pháp phổ thông, trách nhiệm.', 'Nhận lớp trực tiếp không mất phí trung gian, tài liệu trọn khóa.', 'Gia sư', 'Part-time', 130000, 190000, 'day', 'Cầu Giấy, Hà Nội', 'Onsite', 'Ca tối (19h00–21h00)', 3, '2027-03-31', 'tuyendung.hoctot@demo.stuwork.vn', 88, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000014', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'Nhân viên thu ngân ca tối', 'demo-viec-lam-14', 'Thanh toán phần mềm POS, xuất hóa đơn, đối soát cuối ca chính xác.', 'Cẩn thận với con số, thái độ niềm nở, ưu tiên khối Kinh tế.', 'Phần mềm POS dễ dùng, phụ cấp trách nhiệm quầy thu ngân.', 'Bán hàng', 'Part-time', 28000, 34000, 'hour', 'Cầu Giấy, Hà Nội', 'Onsite', 'Ca tối (17h30–22h00)', 2, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 73, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000015', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Cộng tác viên quay dựng video ngắn (CapCut)', 'demo-viec-lam-15', 'Quay điện thoại và dựng clip 30–60 giây review sách hay, góc học tập.', 'Thành thạo CapCut, căn góc sáng đẹp, bắt nhịp âm thanh tốt.', 'Thanh toán theo từng video nghiệm thu, thưởng thêm khi đạt 20k views.', 'Marketing', 'Freelance', 150000, 250000, 'project', 'TP. Hồ Chí Minh', 'Hybrid', 'Cuối tuần hoặc Linh hoạt', 3, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 129, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000016', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Thực tập sinh Kiểm thử phần mềm (QA/Tester)', 'demo-viec-lam-16', 'Viết test case, kiểm thử chức năng web & mobile app, ghi nhận lỗi trên Jira.', 'Sinh viên CNTT/HTTT, tư duy tỉ mỉ, định hướng QA/QC.', 'Đào tạo quy trình Agile thực tế, cơ hội lên chính thức khi ra trường.', 'Công nghệ', 'Internship', 3000000, 4200000, 'month', 'Đà Nẵng', 'Onsite', 'Ca sáng (8h00–12h00)', 2, '2027-03-31', 'people.techstart@demo.stuwork.vn', 94, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000017', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Cộng tác viên Minh họa 2D & Sticker', 'demo-viec-lam-17', 'Vẽ bộ mascot và sticker minh họa phong cách trẻ trung cho ứng dụng học tập.', 'Sử dụng Procreate hoặc Illustrator, đảm bảo tiến độ phác thảo.', 'Ghi tên tác giả vào hồ sơ dự án, hợp đồng cộng tác minh bạch.', 'Thiết kế', 'Freelance', 300000, 600000, 'project', 'Làm việc từ xa', 'Remote', 'Linh hoạt', 2, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 117, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000018', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'Nhân viên hỗ trợ sự kiện Acoustic cuối tuần', 'demo-viec-lam-18', 'Soát mã đặt bàn online, hướng dẫn chỗ ngồi đêm nhạc Acoustic sinh viên.', 'Nhanh nhẹn, giao tiếp lịch thiệp, làm việc tối Thứ 6 & Thứ 7.', 'Lương giờ cuối tuần cao, hỗ trợ ăn nhẹ trước ca.', 'Phục vụ', 'Part-time', 32000, 40000, 'hour', 'Hà Nội', 'Onsite', 'Cuối tuần', 3, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 84, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000019', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Cộng tác viên Tư vấn khóa học (Không ép KPI)', 'demo-viec-lam-19', 'Liên hệ học viên đã đăng ký form học thử để xếp lịch kiểm tra đầu vào.', 'Giọng nói rõ ràng, thân thiện, biết lắng nghe người học.', 'Data học viên đăng ký thật 100%, thưởng thêm theo buổi test.', 'Chăm sóc khách hàng', 'Part-time', 30000, 42000, 'hour', 'TP. Hồ Chí Minh', 'Onsite', 'Ca chiều hoặc Ca tối', 3, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 67, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000020', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 'Cộng tác viên Soạn thảo tài liệu LaTeX / Word', 'demo-viec-lam-20', 'Chuyển đổi phiếu bài tập Toán – Lý sang định dạng Word Mathtype hoặc LaTeX.', 'Biết gõ công thức toán học chính xác, trình bày khoa học.', 'Làm việc online hoàn toàn, nhận bài theo tuần linh hoạt.', 'Cộng tác viên', 'Remote', 28000, 38000, 'hour', 'Làm việc từ xa', 'Remote', 'Linh hoạt', 4, '2027-03-31', 'tuyendung.hoctot@demo.stuwork.vn', 105, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000021', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Cộng tác viên Hỗ trợ kỹ thuật IT Helpdesk', 'demo-viec-lam-21', 'Hỗ trợ cài đặt phần mềm và hướng dẫn sử dụng thiết bị bán hàng cho khách.', 'Sinh viên CNTT/Viễn thông, nắm vững Windows/macOS cơ bản.', 'Rèn kỹ năng giao tiếp khách hàng doanh nghiệp, phụ cấp đi lại.', 'Công nghệ', 'Part-time', 35000, 45000, 'hour', 'Đà Nẵng', 'Onsite', 'Ca chiều (13h30–17h30)', 2, '2027-03-31', 'people.techstart@demo.stuwork.vn', 69, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000022', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Quản trị Fanpage & Cộng đồng Học thuật', 'demo-viec-lam-22', 'Duyệt bài thành viên theo quy tắc cộng đồng, ghim thông báo học bổng.', 'Sử dụng ngôn từ chuẩn mực, khách quan khi kiểm duyệt nội dung.', 'Công việc lâu dài, linh hoạt thời gian mùa thi.', 'Marketing', 'Remote', 25000, 33000, 'hour', 'Làm việc từ xa', 'Remote', 'Ca tối & Cuối tuần', 2, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 131, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000023', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Thiết kế Slide thuyết trình (PowerPoint / Canva)', 'demo-viec-lam-23', 'Chuẩn hóa bố cục, biểu đồ infographic cho bài giảng điện tử (15–25 slides).', 'Thành thạo PowerPoint hoặc Canva Pro, tư duy trình bày trực quan.', 'Cấp sẵn kho tài nguyên bản quyền, thanh toán ngay theo bộ slide.', 'Thiết kế', 'Freelance', 120000, 250000, 'project', 'Làm việc từ xa', 'Remote', 'Linh hoạt', 4, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 148, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000024', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'Nhân viên kiểm kho & trưng bày sản phẩm', 'demo-viec-lam-24', 'Kiểm đếm tồn kho bằng máy quét mã vạch và sắp xếp quầy trưng bày theo chủ đề.', 'Gọn gàng, trung thực, có mắt thẩm mỹ sắp xếp.', 'Không gian làm việc sáng tạo, nghỉ linh hoạt tuần thi.', 'Bán hàng', 'Part-time', 28000, 32000, 'hour', 'Hà Nội', 'Onsite', 'Ca sáng (8h30–12h30)', 2, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 61, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000025', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Gia sư Lập trình Scratch & Python cơ bản', 'demo-viec-lam-25', 'Hướng dẫn học sinh cấp 2 làm quen tư duy thuật toán qua dự án trò chơi nhỏ.', 'Sinh viên CNTT hoặc Sư phạm Tin, truyền đạt sinh động.', 'Thù lao hấp dẫn trên 55.000đ/giờ, giáo trình STEM có sẵn.', 'Gia sư', 'Part-time', 55000, 75000, 'hour', 'TP. Hồ Chí Minh', 'Hybrid', 'Cuối tuần', 3, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 119, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000026', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'Nhân viên trực quầy bánh ngọt & trà chiều', 'demo-viec-lam-26', 'Bảo quản tủ bánh ngọt, đóng hộp mang đi và giới thiệu combo trà bánh.', 'Nhẹ nhàng, sạch sẽ, phù hợp sinh viên năm 1–2.', 'Hỗ trợ gửi xe miễn phí, thưởng doanh thu cuối tháng.', 'Phục vụ', 'Part-time', 23000, 25000, 'hour', 'Thanh Xuân, Hà Nội', 'Onsite', 'Ca chiều (13h00–17h00)', 2, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 77, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000027', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Cộng tác viên Dịch thuật phụ đề Anh – Việt', 'demo-viec-lam-27', 'Dịch và căn chỉnh phụ đề các video khoa học thường thức dài 8–12 phút.', 'Nghe đọc tiếng Anh tốt (IELTS 6.5+), diễn đạt tiếng Việt tự nhiên.', 'Làm việc tại nhà 100%, mở rộng vốn từ học thuật.', 'Cộng tác viên', 'Freelance', 45000, 65000, 'hour', 'Làm việc từ xa', 'Remote', 'Linh hoạt', 3, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 162, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000028', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Thực tập sinh Phân tích dữ liệu (Data Analyst Intern)', 'demo-viec-lam-28', 'Xây dựng dashboard theo dõi chỉ số vận hành bằng SQL và Power BI cùng đội Product.', 'Sinh viên năm cuối ngành HTTT quản lý hoặc Khoa học dữ liệu; nắm vững SQL.', 'Mức lương thỏa thuận theo năng lực, mentor trực tiếp từ trưởng nhóm.', 'Công nghệ', 'Full-time', NULL, NULL, 'month', 'Hà Nội', 'Hybrid', 'Linh hoạt', 1, '2027-03-31', 'people.techstart@demo.stuwork.vn', 140, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000029', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Điều phối viên CLB Tiếng Anh cuối tuần', 'demo-viec-lam-29', 'Dẫn dắt trò chơi kết nối và chia nhóm thảo luận tiếng Anh sáng Chủ nhật.', 'Tự tin đứng trước đám đông, tiếng Anh giao tiếp trôi chảy.', 'Chứng nhận điều phối viên hoạt động ngoại khóa.', 'Cộng tác viên', 'Part-time', 35000, 45000, 'hour', 'Đà Nẵng', 'Onsite', 'Cuối tuần', 2, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 82, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000030', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Trợ lý Chụp ảnh sản phẩm Lifestyle', 'demo-viec-lam-30', 'Hỗ trợ chuẩn bị đạo cụ, ánh sáng cơ bản và chụp hậu trường tại studio.', 'Yêu thích nhiếp ảnh và styling sản phẩm, nhanh nhẹn.', 'Học thực chiến ánh sáng studio miễn phí, bao ăn trưa ngày chụp.', 'Thiết kế', 'Part-time', 35000, 50000, 'hour', 'TP. Hồ Chí Minh', 'Onsite', 'Ca sáng hoặc Ca chiều', 2, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 95, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000031', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'Chăm sóc khách hàng Gian hàng Shopee / Lazada', 'demo-viec-lam-31', 'Tư vấn kích thước sản phẩm, hỗ trợ đổi trả minh bạch trên khung chat sàn TMĐT.', 'Phản hồi tin nhắn nhanh, lịch sự, có laptop cá nhân.', 'Phù hợp sinh viên tại các tỉnh thành khác làm từ xa.', 'Chăm sóc khách hàng', 'Part-time', 24000, 28000, 'hour', 'Các tỉnh thành khác', 'Remote', 'Ca sáng hoặc Ca tối', 3, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 108, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000032', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000007'), 'Nhân viên chuẩn bị phần ăn Salad buổi sáng', 'demo-viec-lam-32', 'Sơ chế rau củ sạch, định lượng khẩu phần salad hộp buổi sáng của Fresh Food Demo.', 'Đúng giờ, đảm bảo vệ sinh an toàn thực phẩm.', 'Tặng 1 phần ăn healthy mỗi ca làm việc.', 'Phục vụ', 'Part-time', 28000, 33000, 'hour', 'Quận 1, TP. Hồ Chí Minh', 'Onsite', 'Ca sáng (6h30–10h30)', 3, '2027-03-31', 'hr.freshfood@demo.stuwork.vn', 15, 'pending', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  status = EXCLUDED.status,
  is_demo = TRUE;

-- 5. Chèn 16 Đơn ứng tuyển Demo đa trạng thái (Pending, Reviewed, Shortlisted, Accepted, Rejected)
INSERT INTO public.applications (id, job_id, student_id, cover_letter, relevant_experience, available_time, status, employer_note)
VALUES
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'Em là Nguyễn Minh Anh, sinh viên năm 3 ngành Marketing, đã có 6 tháng viết bài fanpage.', '6 tháng CTV nội dung CLB Truyền thông', 'Ca tối, Linh hoạt', 'accepted', 'Bài viết thử mạch lạc, thái độ chuyên nghiệp.'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000001', 'Em mong muốn thực tập vị trí Marketing mạng xã hội để phát triển kỹ năng lập kế hoạch.', '6 tháng CTV nội dung', 'Ca sáng & chiều linh hoạt', 'shortlisted', 'Hẹn phỏng vấn online chiều Thứ 5.'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Em là Trần Đức Minh, sinh viên CNTT Bách khoa, từng kèm học sinh lớp 9 đạt 8.5 Toán.', '1 năm kèm Toán lớp 9', 'Ca tối', 'accepted', 'Kiến thức vững, truyền đạt rõ ràng.'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', 'Em gửi hồ sơ ứng tuyển Thực tập sinh Frontend Next.js/React.', '2 dự án môn học React/TS', 'Ca chiều', 'reviewed', 'Đã xem GitHub demo, chờ nhóm kỹ thuật đánh giá.'),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', 'Em có IELTS 7.5 và 4 tháng trợ giảng thiếu nhi.', '4 tháng trợ giảng', 'Ca tối & Cuối tuần', 'accepted', 'Phát âm rất tốt, phù hợp lớp cuối tuần.'),
  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000003', 'Em có thể nhận lớp Gia sư Tiếng Anh tối Thứ 2 và Thứ 4.', 'IELTS 7.5', 'Ca tối', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', 'Em có thể đi làm đều đặn ca sáng các ngày trong tuần tại Cafe Mộc Demo.', '3 tháng bán hàng part-time', 'Ca sáng', 'shortlisted', 'Mời qua quán trao đổi lịch ca.'),
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004', 'Em giao tiếp thân thiện và sử dụng tốt phần mềm bán hàng.', '3 tháng bán hàng', 'Cuối tuần', 'accepted', 'Đã nhận thử việc cuối tuần này.'),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000005', 'Em gửi kèm link Portfolio các ấn phẩm social media đã thực hiện.', 'Freelance cho 5 fanpage', 'Linh hoạt', 'accepted', 'Gu thẩm mỹ hiện đại.'),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000005', 'Em hào hứng với dự án vẽ bộ sticker sinh viên trên Procreate.', 'Minh họa 2D', 'Linh hoạt', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000006', 'Em là sinh viên năm 4 Kỹ thuật phần mềm, đã có kinh nghiệm viết test case.', '3 tháng thực tập QA phòng lab', 'Ca sáng', 'shortlisted', 'Mời phỏng vấn sáng Thứ 3.'),
  ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000021', '20000000-0000-4000-8000-000000000006', 'Em có thể hỗ trợ kỹ thuật ca chiều tại khu vực Hải Châu.', 'Kỹ thuật máy tính', 'Ca chiều', 'reviewed', 'Đang cân nhắc lịch ca chiều.'),
  ('40000000-0000-4000-8000-000000000013', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000007', 'Em là sinh viên Báo chí năm 2, mong muốn cộng tác viết bài.', 'Bản tin sinh viên', 'Linh hoạt', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000014', '30000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000007', 'Em ứng tuyển vị trí quay dựng clip ngắn cuối tuần.', 'Dựng CapCut cơ bản', 'Cuối tuần', 'rejected', 'Đợt tuyển này ưu tiên ứng viên có sẵn mic thu âm rời.'),
  ('40000000-0000-4000-8000-000000000015', '30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000008', 'Em rất yêu thích pha chế đồ uống và mong được học nghề Barista.', 'Hậu cần sự kiện', 'Ca chiều', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000016', '30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000010', 'Em thành thạo Google Sheets và cam kết 12 giờ/tuần.', '4 tháng trực gian hàng', 'Linh hoạt', 'accepted', 'Bài test nhập liệu đạt 99% chính xác.'),
  ('40000000-0000-4000-8000-000000000017', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Em đăng ký ứng tuyển ca tối và cuối tuần tại Cafe Mộc Demo.', '6 tháng CTV truyền thông', 'Ca tối & Cuối tuần', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000018', '30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', 'Em sử dụng thành thạo Canva Pro và Illustrator cơ bản.', 'Thiết kế ấn phẩm CLB', 'Linh hoạt', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000019', '30000000-0000-4000-8000-000000000022', '20000000-0000-4000-8000-000000000001', 'Em đã có kinh nghiệm quản trị fanpage CLB sinh viên.', 'Quản trị fanpage 15.000 thành viên', 'Ca tối', 'reviewed', 'Hồ sơ phù hợp, bộ phận Nhân sự đang xếp lịch trao đổi.'),
  ('40000000-0000-4000-8000-000000000020', '30000000-0000-4000-8000-000000000023', '20000000-0000-4000-8000-000000000001', 'Em gửi hồ sơ ứng tuyển vị trí thiết kế Slide thuyết trình.', 'Thiết kế slide bài giảng', 'Linh hoạt', 'rejected', 'Đợt tuyển này đã đủ số lượng cộng tác viên.')
ON CONFLICT (job_id, student_id) DO UPDATE SET
  status = EXCLUDED.status,
  employer_note = EXCLUDED.employer_note;

-- 6. Công việc đã lưu, Yêu cầu xác minh, Báo cáo, Đánh giá & Thông báo Demo
INSERT INTO public.saved_jobs (id, student_id, job_id)
VALUES
  ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('50000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000007'),
  ('50000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000025')
ON CONFLICT (student_id, job_id) DO NOTHING;

INSERT INTO public.verification_requests (id, employer_id, business_name, representative_name, address, tax_code, website, contact_email, contact_phone, status, admin_note)
VALUES
  ('60000000-0000-4000-8000-000000000001', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000007'), 'Hệ thống Thực phẩm sạch Fresh Food Demo', 'Hoàng Thu Trang', 'Số 56 Nguyễn Thị Minh Khai, Quận 1, TP.HCM (Giả lập)', '0319998887-DEMO', 'https://freshfood.demo.stuwork.vn', 'hr.freshfood@demo.stuwork.vn', '0900100007', 'pending', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.job_reports (id, job_id, reporter_id, reason, description, status, admin_note)
VALUES
  ('70000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000031', '20000000-0000-4000-8000-000000000004', 'Mô tả công việc không đúng thực tế', '(Báo cáo minh họa Demo) Đề nghị kiểm tra lại khung giờ bàn giao ca tối.', 'pending', NULL),
  ('70000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000007', 'Thông tin nhà tuyển dụng đáng ngờ', '(Báo cáo minh họa Demo) Xác nhận quy trình ký thỏa thuận CTV từ xa.', 'resolved', 'Đã đối chiếu với TechStart Demo: hoàn toàn minh bạch, không thu phí.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, job_id, student_id, employer_id, rating, comment)
VALUES
  ('80000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 5, 'Anh chị biên tập tại Media Lab Demo hướng dẫn tận tình, trả nhuận bút đúng hẹn.'),
  ('80000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 5, 'Trung tâm Học Tốt Demo chuẩn bị giáo án bài bản, không thu bất kỳ phí nhận lớp nào.')
ON CONFLICT (job_id, student_id) DO NOTHING;

INSERT INTO public.notifications (id, user_id, title, message, type, is_read, link)
VALUES
  ('90000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Hồ sơ được chấp nhận!', 'Media Lab Demo đã chấp nhận đơn ứng tuyển vị trí CTV viết nội dung chuẩn SEO.', 'application_status', FALSE, '/student/applications'),
  ('90000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Có ứng viên mới ứng tuyển', 'Bùi Tuấn Kiệt vừa gửi hồ sơ ứng tuyển vào vị trí Nhân viên pha chế.', 'new_applicant', FALSE, '/employer/applications'),
  ('90000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Yêu cầu xác minh mới', 'Fresh Food Demo vừa gửi hồ sơ yêu cầu xác minh đơn vị tuyển dụng.', 'verification_approved', FALSE, '/admin/verifications')
ON CONFLICT (id) DO NOTHING;

COMMIT;

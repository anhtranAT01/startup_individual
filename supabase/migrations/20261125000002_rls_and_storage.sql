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

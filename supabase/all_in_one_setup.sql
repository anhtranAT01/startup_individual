-- ==============================================================================
-- STUWORK - MIGRATION 00001: INITIAL DATABASE SCHEMA (11 TABLES, INDEXES, TRIGGERS)
-- Há»‡ quáº£n trá»‹: Supabase PostgreSQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Báº¢NG profiles (LiÃªn káº¿t trá»±c tiáº¿p vá»›i auth.users)
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
-- 2. Báº¢NG student_profiles (Há»“ sÆ¡ chi tiáº¿t cá»§a sinh viÃªn)
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
-- 3. Báº¢NG employer_profiles (Há»“ sÆ¡ doanh nghiá»‡p / cá»­a hÃ ng tuyá»ƒn dá»¥ng)
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
-- 4. Báº¢NG jobs (Tin tuyá»ƒn dá»¥ng viá»‡c lÃ m)
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
-- 5. Báº¢NG applications (ÄÆ¡n á»©ng tuyá»ƒn cá»§a sinh viÃªn)
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
-- 6. Báº¢NG saved_jobs (CÃ´ng viá»‡c yÃªu thÃ­ch Ä‘Ã£ lÆ°u)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_jobs_student_job UNIQUE (student_id, job_id)
);

-- ------------------------------------------------------------------------------
-- 7. Báº¢NG job_reports (BÃ¡o cÃ¡o tin tuyá»ƒn dá»¥ng Ä‘Ã¡ng ngá» / vi pháº¡m)
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
-- 8. Báº¢NG verification_requests (YÃªu cáº§u xÃ¡c minh nhÃ  tuyá»ƒn dá»¥ng)
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
-- 9. Báº¢NG reviews (ÄÃ¡nh giÃ¡ cÃ´ng viá»‡c sau khi Ä‘Æ°á»£c cháº¥p nháº­n & hoÃ n thÃ nh)
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
-- 10. Báº¢NG notifications (ThÃ´ng bÃ¡o trong á»©ng dá»¥ng)
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
-- 11. Báº¢NG admin_logs (Nháº­t kÃ½ thao tÃ¡c quáº£n trá»‹ viÃªn)
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
-- CHá»ˆ Má»¤C Tá»I Æ¯U TRUY Váº¤N (INDEXES)
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
-- TRIGGERS Cáº¬P NHáº¬T updated_at & Äá»’NG Bá»˜ TÃ€I KHOáº¢N ÄÄ‚NG KÃ AN TOÃ€N
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

-- Trigger táº¡o há»“ sÆ¡ tá»± Ä‘á»™ng khi Ä‘Äƒng kÃ½ qua Supabase Auth.
-- Báº¢O Máº¬T QUAN TRá»ŒNG: Tuyá»‡t Ä‘á»‘i KHÃ”NG cho phÃ©p ngÆ°á»i dÃ¹ng tá»± truyá»n role = 'admin' tá»« client!
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
  -- Chá»‰ cháº¥p nháº­n 'employer' hoáº·c máº·c Ä‘á»‹nh lÃ  'student'. Má»i giÃ¡ trá»‹ 'admin' tá»« client Ä‘á»u bá»‹ Ã©p vá» 'student'.
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
-- Báº­t RLS trÃªn toÃ n bá»™ 11 báº£ng vÃ  4 bucket lÆ°u trá»¯ theo nguyÃªn táº¯c phÃ¢n quyá»n cháº·t cháº½
-- ==============================================================================

-- Cáº¥p quyá»n truy cáº­p Data API cÆ¡ báº£n (káº¿t há»£p báº¯t buá»™c vá»›i RLS bÃªn dÆ°á»›i)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.employer_profiles, public.jobs, public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ------------------------------------------------------------------------------
-- Báº¬T RLS CHO Táº¤T Cáº¢ 11 Báº¢NG
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
-- SCHEMA Ná»˜I Bá»˜ CHO HÃ€M KIá»‚M TRA QUYá»€N (TrÃ¡nh lá»™ hÃ m SECURITY DEFINER ra public)
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
-- 1. POLICIES CHO Báº¢NG profiles
-- Báº£o vá»‡ quyá»n riÃªng tÆ°: Sinh viÃªn khÃ´ng lá»™ SÄT/Email cÃ´ng khai; chá»‰ chÃ­nh chá»§,
-- nhÃ  tuyá»ƒn dá»¥ng cÃ³ Ä‘Æ¡n á»©ng tuyá»ƒn cá»§a sinh viÃªn Ä‘Ã³, hoáº·c Admin má»›i Ä‘á»c Ä‘Æ°á»£c.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_authorized" ON public.profiles; CREATE POLICY "profiles_select_own_or_authorized" ON public.profiles FOR SELECT
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

-- NgÆ°á»i dÃ¹ng chá»‰ sá»­a thÃ´ng tin cÃ¡ nhÃ¢n cá»§a chÃ­nh mÃ¬nh, KHÃ”NG Ä‘Æ°á»£c tá»± Ä‘á»•i role hay is_active
DROP POLICY IF EXISTS "profiles_update_own_safe" ON public.profiles; CREATE POLICY "profiles_update_own_safe" ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()) AND is_active = TRUE)
  WITH CHECK (
    id = (SELECT auth.uid())
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles; CREATE POLICY "profiles_admin_update_all" ON public.profiles FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 2. POLICIES CHO Báº¢NG student_profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "student_profiles_select_authorized" ON public.student_profiles; CREATE POLICY "student_profiles_select_authorized" ON public.student_profiles FOR SELECT
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

DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles; CREATE POLICY "student_profiles_insert_own" ON public.student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles; CREATE POLICY "student_profiles_update_own" ON public.student_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. POLICIES CHO Báº¢NG employer_profiles
-- ThÃ´ng tin Ä‘Æ¡n vá»‹ tuyá»ƒn dá»¥ng lÃ  cÃ´ng khai Ä‘á»ƒ sinh viÃªn kiá»ƒm tra tÃ­nh minh báº¡ch;
-- NhÃ  tuyá»ƒn dá»¥ng KHÃ”NG ÄÆ¯á»¢C tá»± sá»­a verification_status.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "employer_profiles_public_read" ON public.employer_profiles; CREATE POLICY "employer_profiles_public_read" ON public.employer_profiles FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "employer_profiles_insert_own" ON public.employer_profiles; CREATE POLICY "employer_profiles_insert_own" ON public.employer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND verification_status = 'not_submitted'
  );

DROP POLICY IF EXISTS "employer_profiles_update_own_no_verify_tamper" ON public.employer_profiles; CREATE POLICY "employer_profiles_update_own_no_verify_tamper" ON public.employer_profiles FOR UPDATE
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

DROP POLICY IF EXISTS "employer_profiles_admin_manage" ON public.employer_profiles; CREATE POLICY "employer_profiles_admin_manage" ON public.employer_profiles FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 4. POLICIES CHO Báº¢NG jobs
-- KhÃ¡ch chá»‰ xem tin active; NTD xem toÃ n bá»™ tin cá»§a mÃ¬nh & chá»‰ xuáº¥t báº£n active khi Ä‘Ã£ verified
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "jobs_public_read_active" ON public.jobs; CREATE POLICY "jobs_public_read_active" ON public.jobs FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'
    OR employer_id = app_security.current_employer_id()
    OR app_security.is_admin()
  );

DROP POLICY IF EXISTS "jobs_employer_insert" ON public.jobs; CREATE POLICY "jobs_employer_insert" ON public.jobs FOR INSERT
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

DROP POLICY IF EXISTS "jobs_employer_update_own" ON public.jobs; CREATE POLICY "jobs_employer_update_own" ON public.jobs FOR UPDATE
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

DROP POLICY IF EXISTS "jobs_admin_manage" ON public.jobs; CREATE POLICY "jobs_admin_manage" ON public.jobs FOR ALL
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 5. POLICIES CHO Báº¢NG applications
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "applications_select_own_or_job_employer_or_admin" ON public.applications; CREATE POLICY "applications_select_own_or_job_employer_or_admin" ON public.applications FOR SELECT
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

DROP POLICY IF EXISTS "applications_student_insert" ON public.applications; CREATE POLICY "applications_student_insert" ON public.applications FOR INSERT
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

-- Sinh viÃªn chá»‰ Ä‘Æ°á»£c rÃºt há»“ sÆ¡ (withdrawn) khi Ä‘Æ¡n Ä‘ang pending/reviewed
DROP POLICY IF EXISTS "applications_student_withdraw" ON public.applications; CREATE POLICY "applications_student_withdraw" ON public.applications FOR UPDATE
  TO authenticated
  USING (student_id = (SELECT auth.uid()) AND status IN ('pending', 'reviewed'))
  WITH CHECK (student_id = (SELECT auth.uid()) AND status = 'withdrawn');

-- NhÃ  tuyá»ƒn dá»¥ng cáº­p nháº­t tráº¡ng thÃ¡i & ghi chÃº cho á»©ng viÃªn thuá»™c tin cá»§a mÃ¬nh
DROP POLICY IF EXISTS "applications_employer_update" ON public.applications; CREATE POLICY "applications_employer_update" ON public.applications FOR UPDATE
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
-- 6. POLICIES CHO Báº¢NG saved_jobs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "saved_jobs_student_manage_own" ON public.saved_jobs; CREATE POLICY "saved_jobs_student_manage_own" ON public.saved_jobs FOR ALL
  TO authenticated
  USING (student_id = (SELECT auth.uid()))
  WITH CHECK (student_id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 7. POLICIES CHO Báº¢NG job_reports
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "job_reports_insert_authenticated" ON public.job_reports; CREATE POLICY "job_reports_insert_authenticated" ON public.job_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()) AND status = 'pending');

DROP POLICY IF EXISTS "job_reports_select_own_or_admin" ON public.job_reports; CREATE POLICY "job_reports_select_own_or_admin" ON public.job_reports FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()) OR app_security.is_admin());

DROP POLICY IF EXISTS "job_reports_admin_update" ON public.job_reports; CREATE POLICY "job_reports_admin_update" ON public.job_reports FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 8. POLICIES CHO Báº¢NG verification_requests
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "verification_requests_select_own_or_admin" ON public.verification_requests; CREATE POLICY "verification_requests_select_own_or_admin" ON public.verification_requests FOR SELECT
  TO authenticated
  USING (
    employer_id = app_security.current_employer_id()
    OR app_security.is_admin()
  );

DROP POLICY IF EXISTS "verification_requests_employer_insert" ON public.verification_requests; CREATE POLICY "verification_requests_employer_insert" ON public.verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id = app_security.current_employer_id()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "verification_requests_admin_update" ON public.verification_requests; CREATE POLICY "verification_requests_admin_update" ON public.verification_requests FOR UPDATE
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin());

-- ------------------------------------------------------------------------------
-- 9. POLICIES CHO Báº¢NG reviews
-- Chá»‰ sinh viÃªn Ä‘Ã£ cÃ³ Ä‘Æ¡n á»©ng tuyá»ƒn Ä‘Æ°á»£c cháº¥p nháº­n (accepted) má»›i Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews; CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "reviews_student_insert_eligible" ON public.reviews; CREATE POLICY "reviews_student_insert_eligible" ON public.reviews FOR INSERT
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
-- 10. POLICIES CHO Báº¢NG notifications
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications; CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "notifications_update_own_read" ON public.notifications; CREATE POLICY "notifications_update_own_read" ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications; CREATE POLICY "notifications_insert_authenticated" ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- 11. POLICIES CHO Báº¢NG admin_logs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_logs_admin_only" ON public.admin_logs; CREATE POLICY "admin_logs_admin_only" ON public.admin_logs FOR ALL
  TO authenticated
  USING (app_security.is_admin())
  WITH CHECK (app_security.is_admin() AND admin_id = (SELECT auth.uid()));

-- ==============================================================================
-- SUPABASE STORAGE: 4 BUCKETS & PHÃ‚N QUYá»€N Tá»†P TIN RIÃŠNG TÆ¯
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

-- Public Buckets: avatars & company-logos (thÆ° má»¥c gá»‘c theo auth.uid())
DROP POLICY IF EXISTS "public_avatars_logos_read" ON storage.objects; CREATE POLICY "public_avatars_logos_read" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('avatars', 'company-logos'));

DROP POLICY IF EXISTS "public_avatars_logos_insert_own" ON storage.objects; CREATE POLICY "public_avatars_logos_insert_own" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "public_avatars_logos_update_own" ON storage.objects; CREATE POLICY "public_avatars_logos_update_own" ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "public_avatars_logos_delete_own" ON storage.objects; CREATE POLICY "public_avatars_logos_delete_own" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'company-logos')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Private Bucket: student-cvs (Chá»§ sá»Ÿ há»¯u, NTD cÃ³ Ä‘Æ¡n á»©ng tuyá»ƒn há»£p lá»‡, hoáº·c Admin)
DROP POLICY IF EXISTS "student_cvs_select_authorized" ON storage.objects; CREATE POLICY "student_cvs_select_authorized" ON storage.objects FOR SELECT
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

DROP POLICY IF EXISTS "student_cvs_write_own" ON storage.objects; CREATE POLICY "student_cvs_write_own" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "student_cvs_update_own" ON storage.objects; CREATE POLICY "student_cvs_update_own" ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "student_cvs_delete_own" ON storage.objects; CREATE POLICY "student_cvs_delete_own" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'student-cvs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Private Bucket: verification-documents (Chá»§ sá»Ÿ há»¯u NTD vÃ  Admin)
DROP POLICY IF EXISTS "verification_docs_select_authorized" ON storage.objects; CREATE POLICY "verification_docs_select_authorized" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR app_security.is_admin()
    )
  );

DROP POLICY IF EXISTS "verification_docs_write_own" ON storage.objects; CREATE POLICY "verification_docs_write_own" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "verification_docs_update_own" ON storage.objects; CREATE POLICY "verification_docs_update_own" ON storage.objects FOR UPDATE
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
-- Cháº¡y an toÃ n nhiá»u láº§n khÃ´ng gÃ¢y trÃ¹ng láº·p (ON CONFLICT DO UPDATE / DO NOTHING)
-- Báº¢O Máº¬T: CÃ¡c báº£n ghi auth.users demo cÃ³ encrypted_password = '' (KHÃ”NG thá»ƒ Ä‘Äƒng
-- nháº­p báº±ng máº­t kháº©u cá»‘ Ä‘á»‹nh cÃ´ng khai trÃªn mÃ´i trÆ°á»ng Production).
-- Táº¥t cáº£ báº£n ghi Ä‘á»u Ä‘Æ°á»£c Ä‘Ã¡nh dáº¥u is_demo = TRUE vÃ  thÃ´ng tin liÃªn há»‡ giáº£ láº­p.
-- ==============================================================================

BEGIN;

-- 1. Khá»Ÿi táº¡o báº£n ghi auth.users khÃ³a máº­t kháº©u cho cÃ¡c há»“ sÆ¡ minh há»a (thá»a khÃ³a ngoáº¡i)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ban Quáº£n Trá»‹ STUWORK (Demo)","is_demo":true}', NOW(), NOW()),
  -- 8 NhÃ  tuyá»ƒn dá»¥ng Demo
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr.cafemoc@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nguyá»…n ThÃ nh Trung","role":"employer","company_name":"Cafe Má»™c Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tuyendung.hoctot@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tráº§n Thanh HÆ°Æ¡ng","role":"employer","company_name":"Trung tÃ¢m Há»c Tá»‘t Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'talent.medialab@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"LÃª HoÃ ng BÃ¡ch","role":"employer","company_name":"Media Lab Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr.localstore@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pháº¡m Mai PhÆ°Æ¡ng","role":"employer","company_name":"Local Store Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'careers.eduplus@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Äinh Quá»‘c Viá»‡t","role":"employer","company_name":"EduPlus Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'people.techstart@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"VÃµ Minh KhÃ´i","role":"employer","company_name":"TechStart Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr.freshfood@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"HoÃ ng Thu Trang","role":"employer","company_name":"Fresh Food Demo","is_demo":true}', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hello.creativestudio@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"LÃ½ Gia HÃ¢n","role":"employer","company_name":"Creative Studio Demo","is_demo":true}', NOW(), NOW()),
  -- 10 Sinh viÃªn Demo
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'minhanh.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nguyá»…n Minh Anh","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ducminh.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tráº§n Äá»©c Minh","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'thuha.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"LÃª Thu HÃ ","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'quanghuy.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pháº¡m Quang Huy","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ngoclinh.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"HoÃ ng Ngá»c Linh","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hainam.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"VÅ© Háº£i Nam","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'phuongthao.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Äáº·ng PhÆ°Æ¡ng Tháº£o","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tuankiet.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"BÃ¹i Tuáº¥n Kiá»‡t","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'khanhvy.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"NgÃ´ KhÃ¡nh Vy","role":"student","is_demo":true}', NOW(), NOW()),
  ('20000000-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'giabao.sv@demo.stuwork.vn', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Äá»— Gia Báº£o","role":"student","is_demo":true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Äáº£m báº£o tÃ i khoáº£n quáº£n trá»‹ minh há»a mang role = 'admin' tá»« phÃ­a server SQL
UPDATE public.profiles
SET role = 'admin', full_name = 'Ban Quáº£n Trá»‹ STUWORK (Demo)', phone = '0900000001', is_demo = TRUE
WHERE id = '00000000-0000-4000-8000-000000000001';

DELETE FROM public.student_profiles WHERE user_id = '00000000-0000-4000-8000-000000000001';

-- 2. Äá»“ng bá»™ 8 Há»“ sÆ¡ NhÃ  tuyá»ƒn dá»¥ng Demo
INSERT INTO public.employer_profiles (
  id, user_id, company_name, description, industry, address, website,
  contact_email, contact_phone, founded_info, verification_status, is_demo
)
VALUES
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Cafe Má»™c Demo', 'KhÃ´ng gian cÃ  phÃª sÃ¡ch vÃ  Ä‘á»“ uá»‘ng thá»§ cÃ´ng dÃ nh cho giá»›i tráº» táº¡i HÃ  Ná»™i. MÃ´i trÆ°á»ng thÃ¢n thiá»‡n, linh hoáº¡t xoay ca theo lá»‹ch há»c sinh viÃªn.', 'F&B â€“ Chuá»—i Ä‘á»“ uá»‘ng', 'Sá»‘ 42 Tráº§n ThÃ¡i TÃ´ng, Cáº§u Giáº¥y, HÃ  Ná»™i (Äá»‹a chá»‰ giáº£ láº­p)', 'https://cafemoc.demo.stuwork.vn', 'hr.cafemoc@demo.stuwork.vn', '0900100001', 'Hoáº¡t Ä‘á»™ng 3 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Trung tÃ¢m Há»c Tá»‘t Demo', 'ÄÆ¡n vá»‹ bá»“i dÆ°á»¡ng kiáº¿n thá»©c ToÃ¡n â€“ Tiáº¿ng Anh â€“ Khoa há»c tá»± nhiÃªn cho há»c sinh THCS & THPT.', 'GiÃ¡o dá»¥c & ÄÃ o táº¡o', 'Sá»‘ 118 Nguyá»…n TrÃ£i, Thanh XuÃ¢n, HÃ  Ná»™i (Äá»‹a chá»‰ giáº£ láº­p)', 'https://hoctot.demo.stuwork.vn', 'tuyendung.hoctot@demo.stuwork.vn', '0900100002', 'Hoáº¡t Ä‘á»™ng 5 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Media Lab Demo', 'Agency sÃ¡ng táº¡o ná»™i dung sá»‘, sáº£n xuáº¥t bÃ i viáº¿t SEO, ká»‹ch báº£n video ngáº¯n vÃ  chiáº¿n dá»‹ch truyá»n thÃ´ng.', 'Truyá»n thÃ´ng & Ná»™i dung sá»‘', 'Táº§ng 5, TÃ²a nhÃ  SÃ¡ng Táº¡o, Quáº­n 3, TP. Há»“ ChÃ­ Minh (Äá»‹a chá»‰ giáº£ láº­p)', 'https://medialab.demo.stuwork.vn', 'talent.medialab@demo.stuwork.vn', '0900100003', 'Hoáº¡t Ä‘á»™ng 4 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'Local Store Demo', 'Cá»­a hÃ ng phá»¥ kiá»‡n, vÄƒn phÃ²ng pháº©m vÃ  quÃ  táº·ng thiáº¿t káº¿ tá»‘i giáº£n dÃ nh cho há»c sinh â€“ sinh viÃªn.', 'BÃ¡n láº» & Thá»i trang', 'Sá»‘ 85 ChÃ¹a Bá»™c, Äá»‘ng Äa, HÃ  Ná»™i (Äá»‹a chá»‰ giáº£ láº­p)', 'https://localstore.demo.stuwork.vn', 'hr.localstore@demo.stuwork.vn', '0900100004', 'Hoáº¡t Ä‘á»™ng 2 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'EduPlus Demo', 'Ná»n táº£ng há»c tiáº¿ng Anh giao tiáº¿p vÃ  luyá»‡n thi chá»©ng chá»‰ quá»‘c táº¿ káº¿t há»£p trá»±c tiáº¿p vÃ  trá»±c tuyáº¿n.', 'CÃ´ng nghá»‡ GiÃ¡o dá»¥c (EdTech)', 'Sá»‘ 210 Äiá»‡n BiÃªn Phá»§, BÃ¬nh Tháº¡nh, TP. Há»“ ChÃ­ Minh (Äá»‹a chá»‰ giáº£ láº­p)', 'https://eduplus.demo.stuwork.vn', 'careers.eduplus@demo.stuwork.vn', '0900100005', 'Hoáº¡t Ä‘á»™ng 4 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000006', 'TechStart Demo', 'Startup phÃ¡t triá»ƒn pháº§n má»m SaaS quáº£n lÃ½ bÃ¡n hÃ ng vÃ  á»©ng dá»¥ng di Ä‘á»™ng dÃ nh cho doanh nghiá»‡p vá»«a vÃ  nhá».', 'CÃ´ng nghá»‡ thÃ´ng tin & Pháº§n má»m', 'Khu CÃ´ng nghá»‡ Pháº§n má»m, Háº£i ChÃ¢u, ÄÃ  Náºµng (Äá»‹a chá»‰ giáº£ láº­p)', 'https://techstart.demo.stuwork.vn', 'people.techstart@demo.stuwork.vn', '0900100006', 'Hoáº¡t Ä‘á»™ng 3 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE),
  ('11000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000007', 'Fresh Food Demo', 'Há»‡ thá»‘ng cá»­a hÃ ng thá»±c pháº©m sáº¡ch, salad vÃ  Ä‘á»“ Äƒn lÃ nh máº¡nh giao nhanh ná»™i thÃ nh.', 'Thá»±c pháº©m sáº¡ch & BÃ¡n láº»', 'Sá»‘ 56 Nguyá»…n Thá»‹ Minh Khai, Quáº­n 1, TP. Há»“ ChÃ­ Minh (Äá»‹a chá»‰ giáº£ láº­p)', 'https://freshfood.demo.stuwork.vn', 'hr.freshfood@demo.stuwork.vn', '0900100007', 'Hoáº¡t Ä‘á»™ng 2 nÄƒm (MÃ´ hÃ¬nh Demo)', 'pending', TRUE),
  ('11000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000008', 'Creative Studio Demo', 'XÆ°á»Ÿng thiáº¿t káº¿ nháº­n diá»‡n thÆ°Æ¡ng hiá»‡u, minh há»a 2D vÃ  sáº£n xuáº¥t áº¥n pháº©m sá»± kiá»‡n tráº» trung.', 'Thiáº¿t káº¿ SÃ¡ng táº¡o', 'Sá»‘ 19 TÃ´ Ngá»c VÃ¢n, TÃ¢y Há»“, HÃ  Ná»™i (Äá»‹a chá»‰ giáº£ láº­p)', 'https://creativestudio.demo.stuwork.vn', 'hello.creativestudio@demo.stuwork.vn', '0900100008', 'Hoáº¡t Ä‘á»™ng 3 nÄƒm (MÃ´ hÃ¬nh Demo)', 'verified', TRUE)
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  industry = EXCLUDED.industry,
  address = EXCLUDED.address,
  website = EXCLUDED.website,
  verification_status = EXCLUDED.verification_status,
  is_demo = TRUE;

-- 3. Cáº­p nháº­t chi tiáº¿t 10 Há»“ sÆ¡ Sinh viÃªn Demo
INSERT INTO public.student_profiles (user_id, university, major, year_of_study, location, bio, skills, experience, desired_job_title, desired_salary, availability)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'TrÆ°á»ng Äáº¡i há»c Kinh táº¿ Quá»‘c dÃ¢n (Demo)', 'Marketing', 3, 'HÃ  Ná»™i', 'Sinh viÃªn nÄƒm 3 chuyÃªn ngÃ nh Marketing sá»‘, yÃªu thÃ­ch viáº¿t lÃ¡ch vÃ  quáº£n trá»‹ fanpage.', ARRAY['Viáº¿t ná»™i dung','Canva','Marketing','Quáº£n trá»‹ Fanpage'], '6 thÃ¡ng lÃ m CTV ná»™i dung cho CLB Truyá»n thÃ´ng.', 'CTV Content Marketing', 35000, '{"shifts":["Ca tá»‘i","Linh hoáº¡t","Cuá»‘i tuáº§n"],"days":["T2","T4","T6","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000002', 'Äáº¡i há»c BÃ¡ch khoa HÃ  Ná»™i (Demo)', 'CÃ´ng nghá»‡ thÃ´ng tin', 3, 'HÃ  Ná»™i', 'Sinh viÃªn CNTT náº¯m vá»¯ng React, TypeScript, SQL vÃ  ToÃ¡n THPT.', ARRAY['React','TypeScript','HTML/CSS','Gia sÆ° ToÃ¡n'], 'ÄÃ£ xÃ¢y dá»±ng 2 website mÃ´n há»c vÃ  kÃ¨m ToÃ¡n lá»›p 9.', 'Thá»±c táº­p sinh Frontend / Gia sÆ° ToÃ¡n', 45000, '{"shifts":["Ca chiá»u","Ca tá»‘i"],"days":["T3","T5","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000003', 'TrÆ°á»ng Äáº¡i há»c Ngoáº¡i ngá»¯ (Demo)', 'NgÃ´n ngá»¯ Anh', 2, 'HÃ  Ná»™i', 'NÄƒng Ä‘á»™ng, IELTS 7.5, yÃªu thÃ­ch giáº£ng dáº¡y thiáº¿u nhi.', ARRAY['Tiáº¿ng Anh IELTS 7.5','Trá»£ giáº£ng','Giao tiáº¿p'], 'Trá»£ giáº£ng lá»›p giao tiáº¿p thiáº¿u nhi 4 thÃ¡ng.', 'Trá»£ giáº£ng Tiáº¿ng Anh', 40000, '{"shifts":["Ca tá»‘i","Cuá»‘i tuáº§n"],"days":["T2","T4","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000004', 'TrÆ°á»ng Äáº¡i há»c ThÆ°Æ¡ng máº¡i (Demo)', 'Kinh táº¿ Ä‘á»‘i ngoáº¡i', 2, 'HÃ  Ná»™i', 'Nhanh nháº¹n, trung thá»±c, giao tiáº¿p thÃ¢n thiá»‡n.', ARRAY['BÃ¡n hÃ ng','Thu ngÃ¢n','ChÄƒm sÃ³c khÃ¡ch hÃ ng'], 'NhÃ¢n viÃªn bÃ¡n hÃ ng part-time 3 thÃ¡ng.', 'NhÃ¢n viÃªn bÃ¡n hÃ ng', 30000, '{"shifts":["Ca sÃ¡ng","Cuá»‘i tuáº§n"],"days":["T2","T3","T6","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000005', 'TrÆ°á»ng Äáº¡i há»c Kiáº¿n trÃºc (Demo)', 'Thiáº¿t káº¿ Ä‘á»“ há»a', 3, 'TP. Há»“ ChÃ­ Minh', 'Äam mÃª thiáº¿t káº¿ banner máº¡ng xÃ£ há»™i vÃ  nháº­n diá»‡n thÆ°Æ¡ng hiá»‡u.', ARRAY['Photoshop','Illustrator','Figma','Thiáº¿t káº¿ Ä‘á»“ há»a'], 'Freelance thiáº¿t káº¿ cho 5 fanpage áº©m thá»±c.', 'Thiáº¿t káº¿ Ä‘á»“ há»a Part-time', 45000, '{"shifts":["Linh hoáº¡t","Ca tá»‘i"],"days":["T2","T3","T4","T5","T6"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000006', 'TrÆ°á»ng Äáº¡i há»c BÃ¡ch khoa ÄÃ  Náºµng (Demo)', 'Ká»¹ thuáº­t pháº§n má»m', 4, 'ÄÃ  Náºµng', 'TÆ° duy logic tá»‘t, yÃªu thÃ­ch kiá»ƒm thá»­ pháº§n má»m QA/Tester.', ARRAY['Kiá»ƒm thá»­ pháº§n má»m','SQL','JavaScript'], 'Thá»±c táº­p QA ná»™i bá»™ táº¡i phÃ²ng lab 3 thÃ¡ng.', 'Thá»±c táº­p sinh Tester', 35000, '{"shifts":["Ca sÃ¡ng","Ca chiá»u"],"days":["T2","T4","T6"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000007', 'TrÆ°á»ng Äáº¡i há»c KHXH & NhÃ¢n vÄƒn (Demo)', 'BÃ¡o chÃ­ â€“ Truyá»n thÃ´ng', 2, 'TP. Há»“ ChÃ­ Minh', 'BiÃªn táº­p tiáº¿ng Viá»‡t máº¡ch láº¡c, báº¯t nhá»‹p xu hÆ°á»›ng vÄƒn minh.', ARRAY['BiÃªn táº­p bÃ i viáº¿t','SEO cÆ¡ báº£n','Ká»‹ch báº£n TikTok'], 'CTV báº£n tin sinh viÃªn.', 'CTV Viáº¿t bÃ i', 30000, '{"shifts":["Linh hoáº¡t"],"days":["T2","T3","T5","T7"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000008', 'TrÆ°á»ng Äáº¡i há»c NgÃ¢n hÃ ng TP.HCM (Demo)', 'TÃ i chÃ­nh â€“ NgÃ¢n hÃ ng', 1, 'TP. Há»“ ChÃ­ Minh', 'ChÄƒm chá»‰, Ä‘Ãºng giá», muá»‘n tráº£i nghiá»‡m pha cháº¿ & phá»¥c vá»¥.', ARRAY['Phá»¥c vá»¥','Pha cháº¿ cÆ¡ báº£n','Thu ngÃ¢n'], 'Háº­u cáº§n ngÃ y há»™i tÃ¢n sinh viÃªn.', 'NhÃ¢n viÃªn phá»¥c vá»¥ / Pha cháº¿', 26000, '{"shifts":["Ca chiá»u","Cuá»‘i tuáº§n"],"days":["T4","T6","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000009', 'TrÆ°á»ng Äáº¡i há»c SÆ° pháº¡m ÄÃ  Náºµng (Demo)', 'SÆ° pháº¡m ToÃ¡n', 3, 'ÄÃ  Náºµng', 'KiÃªn nháº«n, cÃ³ phÆ°Æ¡ng phÃ¡p dáº¡y há»c sinh láº¥y láº¡i gá»‘c mÃ´n ToÃ¡n.', ARRAY['Gia sÆ° ToÃ¡n','SÆ° pháº¡m','Soáº¡n Ä‘á» Ã´n táº­p'], 'Gia sÆ° ToÃ¡n lá»›p 7â€“8 trong 1.5 nÄƒm.', 'Gia sÆ° ToÃ¡n THCS', 50000, '{"shifts":["Ca tá»‘i","Cuá»‘i tuáº§n"],"days":["T3","T5","T7","CN"]}'::jsonb),
  ('20000000-0000-4000-8000-000000000010', 'Há»c viá»‡n CÃ´ng nghá»‡ BÆ°u chÃ­nh Viá»…n thÃ´ng (Demo)', 'ThÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­', 2, 'HÃ  Ná»™i', 'ThÃ nh tháº¡o Google Sheets vÃ  chÄƒm sÃ³c khÃ¡ch hÃ ng TMÄT.', ARRAY['Nháº­p liá»‡u','Google Sheets','ChÄƒm sÃ³c khÃ¡ch hÃ ng'], 'Há»— trá»£ trá»±c gian hÃ ng sÃ¡ch trá»±c tuyáº¿n 4 thÃ¡ng.', 'CTV Nháº­p liá»‡u / Trá»±c Page', 28000, '{"shifts":["Ca tá»‘i","Linh hoáº¡t"],"days":["T2","T3","T4","T5","CN"]}'::jsonb)
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

-- 4. ChÃ¨n 32 CÃ´ng viá»‡c Demo (31 active + 1 pending cá»§a NTD chá» xÃ¡c minh)
INSERT INTO public.jobs (
  id, employer_id, title, slug, description, requirements, benefits,
  category, job_type, salary_min, salary_max, salary_unit,
  location, work_mode, working_time, vacancies, deadline, contact_info, views_count, status, is_demo
)
VALUES
  ('30000000-0000-4000-8000-000000000001', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'NhÃ¢n viÃªn phá»¥c vá»¥ quÃ¡n cafe', 'demo-viec-lam-1', 'ÄÃ³n tiáº¿p khÃ¡ch hÃ ng, giá»›i thiá»‡u menu Ä‘á»“ uá»‘ng, bÆ°ng bÃª phá»¥c vá»¥ táº¡i bÃ n vÃ  giá»¯ gÃ¬n khÃ´ng gian quÃ¡n sáº¡ch sáº½.', 'Sinh viÃªn tá»« 18 tuá»•i, giao tiáº¿p thÃ¢n thiá»‡n, Ä‘Ãºng giá», cÃ³ trÃ¡ch nhiá»‡m. ÄÄƒng kÃ½ tá»‘i thiá»ƒu 4 ca/tuáº§n.', 'ÄÆ°á»£c hÆ°á»›ng dáº«n cÃ´ng viá»‡c tá»« Ä‘áº§u, há»— trá»£ 1 Ä‘á»“ uá»‘ng má»—i ca, xoay ca linh hoáº¡t theo lá»‹ch thi.', 'Phá»¥c vá»¥', 'Part-time', 25000, 30000, 'hour', 'Cáº§u Giáº¥y, HÃ  Ná»™i', 'Onsite', 'Ca sÃ¡ng hoáº·c Ca tá»‘i', 4, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 120, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000002', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 'Gia sÆ° ToÃ¡n cáº¥p 2', 'demo-viec-lam-2', 'KÃ¨m 1-1 hoáº·c nhÃ³m nhá» mÃ´n ToÃ¡n lá»›p 7â€“9 theo khung chÆ°Æ¡ng trÃ¬nh chuáº©n cá»§a Trung tÃ¢m Há»c Tá»‘t Demo.', 'Náº¯m vá»¯ng kiáº¿n thá»©c ToÃ¡n cáº¥p 2, kiÃªn nháº«n, diá»…n Ä‘áº¡t máº¡ch láº¡c.', 'Chá»§ Ä‘á»™ng lá»‹ch dáº¡y, cÃ³ sáºµn giÃ¡o Ã¡n chuáº©n hÃ³a, khÃ´ng thu phÃ­ nháº­n lá»›p.', 'Gia sÆ°', 'Part-time', 120000, 180000, 'day', 'Thanh XuÃ¢n, HÃ  Ná»™i', 'Onsite', 'Ca tá»‘i (18h30â€“20h30)', 3, '2027-03-31', 'tuyendung.hoctot@demo.stuwork.vn', 145, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000003', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Cá»™ng tÃ¡c viÃªn viáº¿t ná»™i dung chuáº©n SEO', 'demo-viec-lam-3', 'Viáº¿t bÃ i chia sáº» kiáº¿n thá»©c há»c táº­p, Ä‘á»i sá»‘ng sinh viÃªn vÃ  giá»›i thiá»‡u sáº£n pháº©m cÃ´ng nghá»‡ (800â€“1.200 tá»«/bÃ i).', 'Viáº¿t tiáº¿ng Viá»‡t tá»‘t, khÃ´ng sao chÃ©p ná»™i dung, Ä‘áº£m báº£o 3â€“5 bÃ i/tuáº§n.', 'LÃ m viá»‡c tá»« xa 100%, Ä‘Æ°á»£c hÆ°á»›ng dáº«n SEO thá»±c chiáº¿n, xÃ©t tÄƒng nhuáº­n bÃºt sau 15 bÃ i.', 'Marketing', 'Freelance', 80000, 150000, 'project', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Linh hoáº¡t', 5, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 210, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000004', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'NhÃ¢n viÃªn bÃ¡n hÃ ng cuá»‘i tuáº§n', 'demo-viec-lam-4', 'TÆ° váº¥n khÃ¡ch chá»n sá»• tay, phá»¥ kiá»‡n bÃ n há»c, gÃ³i quÃ  táº·ng táº¡i cá»­a hÃ ng Local Store Demo.', 'Giao tiáº¿p tá»‘t, trung thá»±c, lÃ m viá»‡c Thá»© 7 vÃ  Chá»§ nháº­t.', 'ThÆ°á»Ÿng doanh sá»‘ tuáº§n, Æ°u Ä‘Ã£i nhÃ¢n viÃªn 25%, mÃ´i trÆ°á»ng tráº» trung.', 'BÃ¡n hÃ ng', 'Part-time', 30000, 35000, 'hour', 'Äá»‘ng Äa, HÃ  Ná»™i', 'Onsite', 'Cuá»‘i tuáº§n', 3, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 98, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000005', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Trá»£ giáº£ng Tiáº¿ng Anh giao tiáº¿p thiáº¿u nhi', 'demo-viec-lam-5', 'Há»— trá»£ giáº£ng viÃªn nÆ°á»›c ngoÃ i quáº£n lÃ½ lá»›p há»c 12â€“15 bÃ©, hÆ°á»›ng dáº«n hoáº¡t Ä‘á»™ng nhÃ³m.', 'Tiáº¿ng Anh giao tiáº¿p khÃ¡ (IELTS 6.0+), yÃªu tráº», nÄƒng Ä‘á»™ng.', 'RÃ¨n pháº£n xáº¡ tiáº¿ng Anh má»—i ngÃ y, cáº¥p chá»©ng nháº­n trá»£ giáº£ng sau 6 thÃ¡ng.', 'Gia sÆ°', 'Part-time', 38000, 50000, 'hour', 'BÃ¬nh Tháº¡nh, TP. Há»“ ChÃ­ Minh', 'Onsite', 'Ca tá»‘i & Cuá»‘i tuáº§n', 4, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 134, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000006', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Thá»±c táº­p sinh Frontend Next.js / React', 'demo-viec-lam-6', 'Tham gia phÃ¡t triá»ƒn giao diá»‡n module bÃ¡o cÃ¡o cho ná»n táº£ng SaaS báº±ng React, Next.js vÃ  Tailwind CSS.', 'Sinh viÃªn nÄƒm 3â€“4 ngÃ nh CNTT, náº¯m vá»¯ng HTML/CSS, TypeScript cÆ¡ báº£n vÃ  Git.', 'Trá»£ cáº¥p thá»±c táº­p hÃ ng thÃ¡ng, review code 1-1, há»— trá»£ sá»‘ liá»‡u bÃ¡o cÃ¡o tá»‘t nghiá»‡p.', 'CÃ´ng nghá»‡', 'Internship', 3500000, 5000000, 'month', 'Háº£i ChÃ¢u, ÄÃ  Náºµng', 'Hybrid', 'Ca sÃ¡ng hoáº·c Ca chiá»u', 2, '2027-03-31', 'people.techstart@demo.stuwork.vn', 176, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000007', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Thiáº¿t káº¿ Ä‘á»“ há»a Social Media (Part-time)', 'demo-viec-lam-7', 'Thiáº¿t káº¿ bá»™ áº£nh bÃ i Ä‘Äƒng Facebook/Instagram, banner chiáº¿n dá»‹ch vÃ  standee sá»± kiá»‡n.', 'Sá»­ dá»¥ng tá»‘t Illustrator, Photoshop hoáº·c Figma; cÃ³ Portfolio cÆ¡ báº£n.', 'ÄÆ°á»£c Art Director hÆ°á»›ng dáº«n bá»‘ cá»¥c, tráº£ lÆ°Æ¡ng theo giá» rÃµ rÃ ng.', 'Thiáº¿t káº¿', 'Freelance', 40000, 55000, 'hour', 'TÃ¢y Há»“, HÃ  Ná»™i', 'Hybrid', 'Linh hoáº¡t', 2, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 112, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000008', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'NhÃ¢n viÃªn pha cháº¿ (Barista Part-time)', 'demo-viec-lam-8', 'Pha cháº¿ cÃ  phÃª mÃ¡y, trÃ  trÃ¡i cÃ¢y theo cÃ´ng thá»©c Ä‘á»‹nh lÆ°á»£ng chuáº©n cá»§a Cafe Má»™c Demo.', 'Sáº¡ch sáº½, tá»‰ má»‰. ChÆ°a cÃ³ kinh nghiá»‡m Ä‘Æ°á»£c Ä‘Ã o táº¡o trong 5 buá»•i Ä‘áº§u váº«n cÃ³ phá»¥ cáº¥p.', 'ÄÃ o táº¡o Barista miá»…n phÃ­, xÃ©t tÄƒng báº­c lÆ°Æ¡ng sau má»—i 3 thÃ¡ng.', 'Phá»¥c vá»¥', 'Part-time', 28000, 35000, 'hour', 'Cáº§u Giáº¥y, HÃ  Ná»™i', 'Onsite', 'Ca sÃ¡ng hoáº·c Ca chiá»u', 2, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 89, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000009', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'ChÄƒm sÃ³c há»c viÃªn trá»±c tuyáº¿n (CSKH Online)', 'demo-viec-lam-9', 'Giáº£i Ä‘Ã¡p tháº¯c máº¯c lá»‹ch há»c, há»— trá»£ ká»¹ thuáº­t Zoom vÃ  nháº¯c lá»‹ch kiá»ƒm tra Ä‘á»‹nh ká»³.', 'CÃ³ mÃ¡y tÃ­nh cÃ¡ nhÃ¢n, máº¡ng á»•n Ä‘á»‹nh, giao tiáº¿p lá»‹ch sá»±.', 'LÃ m viá»‡c táº¡i nhÃ  an toÃ n, khÃ´ng Ã¡p doanh sá»‘ bÃ¡n hÃ ng.', 'ChÄƒm sÃ³c khÃ¡ch hÃ ng', 'Remote', 26000, 32000, 'hour', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Ca tá»‘i (18h00â€“22h00)', 4, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 154, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000010', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'NhÃ¢n viÃªn Ä‘Ã³ng gÃ³i Ä‘Æ¡n hÃ ng sÃ¡ch & quÃ  táº·ng', 'demo-viec-lam-10', 'Kiá»ƒm tra sáº£n pháº©m theo phiáº¿u Ä‘Æ¡n TMÄT, bá»c chá»‘ng sá»‘c cáº©n tháº­n vÃ  dÃ¡n mÃ£ váº­n Ä‘Æ¡n.', 'Cáº©n tháº­n, trung thá»±c, khÃ´ng yÃªu cáº§u kinh nghiá»‡m.', 'Kho hÃ ng Ä‘iá»u hÃ²a mÃ¡t máº», thanh toÃ¡n lÆ°Æ¡ng 2 tuáº§n/láº§n.', 'BÃ¡n hÃ ng', 'Part-time', 26000, 30000, 'hour', 'Äá»‘ng Äa, HÃ  Ná»™i', 'Onsite', 'Ca chiá»u (13h30â€“17h30)', 3, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 76, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000011', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Cá»™ng tÃ¡c viÃªn nháº­p liá»‡u & chuáº©n hÃ³a danh má»¥c', 'demo-viec-lam-11', 'Kiá»ƒm tra chÃ­nh táº£, phÃ¢n loáº¡i tháº» danh má»¥c sáº£n pháº©m máº«u vÃ  chuáº©n hÃ³a báº£ng biá»ƒu.', 'ThÃ nh tháº¡o Excel / Google Sheets cÆ¡ báº£n, tá»‰ má»‰, báº£o máº­t dá»¯ liá»‡u.', 'HoÃ n toÃ n khÃ´ng thu phÃ­ hay Ä‘áº·t cá»c, kÃ½ thá»a thuáº­n CTV minh báº¡ch.', 'Cá»™ng tÃ¡c viÃªn', 'Remote', 25000, 30000, 'hour', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Linh hoáº¡t', 6, '2027-03-31', 'people.techstart@demo.stuwork.vn', 198, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000012', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Thá»±c táº­p sinh Marketing máº¡ng xÃ£ há»™i', 'demo-viec-lam-12', 'LÃªn lá»‹ch ná»™i dung tuáº§n, phá»‘i há»£p Designer sáº£n xuáº¥t bÃ i Ä‘Äƒng tÆ°Æ¡ng tÃ¡c vÃ  bÃ¡o cÃ¡o chá»‰ sá»‘.', 'Sinh viÃªn chuyÃªn ngÃ nh Marketing, Truyá»n thÃ´ng; sÃ¡ng táº¡o, chá»§ Ä‘á»™ng.', 'Tham gia dá»± Ã¡n thá»±c táº¿, há»— trá»£ gá»­i xe vÃ  phá»¥ cáº¥p Äƒn trÆ°a.', 'Marketing', 'Internship', 3000000, 4500000, 'month', 'Quáº­n 3, TP. Há»“ ChÃ­ Minh', 'Hybrid', 'Ca sÃ¡ng & Ca chiá»u linh hoáº¡t', 3, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 142, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000013', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 'Gia sÆ° Tiáº¿ng Anh lá»›p 6 â€“ lá»›p 8', 'demo-viec-lam-13', 'HÆ°á»›ng dáº«n ngá»¯ phÃ¡p trá»ng tÃ¢m vÃ  luyá»‡n phÃ¡t Ã¢m cho há»c sinh THCS táº¡i khu vá»±c Cáº§u Giáº¥y.', 'PhÃ¡t Ã¢m chuáº©n, náº¯m cháº¯c ngá»¯ phÃ¡p phá»• thÃ´ng, trÃ¡ch nhiá»‡m.', 'Nháº­n lá»›p trá»±c tiáº¿p khÃ´ng máº¥t phÃ­ trung gian, tÃ i liá»‡u trá»n khÃ³a.', 'Gia sÆ°', 'Part-time', 130000, 190000, 'day', 'Cáº§u Giáº¥y, HÃ  Ná»™i', 'Onsite', 'Ca tá»‘i (19h00â€“21h00)', 3, '2027-03-31', 'tuyendung.hoctot@demo.stuwork.vn', 88, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000014', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'NhÃ¢n viÃªn thu ngÃ¢n ca tá»‘i', 'demo-viec-lam-14', 'Thanh toÃ¡n pháº§n má»m POS, xuáº¥t hÃ³a Ä‘Æ¡n, Ä‘á»‘i soÃ¡t cuá»‘i ca chÃ­nh xÃ¡c.', 'Cáº©n tháº­n vá»›i con sá»‘, thÃ¡i Ä‘á»™ niá»m ná»Ÿ, Æ°u tiÃªn khá»‘i Kinh táº¿.', 'Pháº§n má»m POS dá»… dÃ¹ng, phá»¥ cáº¥p trÃ¡ch nhiá»‡m quáº§y thu ngÃ¢n.', 'BÃ¡n hÃ ng', 'Part-time', 28000, 34000, 'hour', 'Cáº§u Giáº¥y, HÃ  Ná»™i', 'Onsite', 'Ca tá»‘i (17h30â€“22h00)', 2, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 73, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000015', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Cá»™ng tÃ¡c viÃªn quay dá»±ng video ngáº¯n (CapCut)', 'demo-viec-lam-15', 'Quay Ä‘iá»‡n thoáº¡i vÃ  dá»±ng clip 30â€“60 giÃ¢y review sÃ¡ch hay, gÃ³c há»c táº­p.', 'ThÃ nh tháº¡o CapCut, cÄƒn gÃ³c sÃ¡ng Ä‘áº¹p, báº¯t nhá»‹p Ã¢m thanh tá»‘t.', 'Thanh toÃ¡n theo tá»«ng video nghiá»‡m thu, thÆ°á»Ÿng thÃªm khi Ä‘áº¡t 20k views.', 'Marketing', 'Freelance', 150000, 250000, 'project', 'TP. Há»“ ChÃ­ Minh', 'Hybrid', 'Cuá»‘i tuáº§n hoáº·c Linh hoáº¡t', 3, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 129, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000016', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Thá»±c táº­p sinh Kiá»ƒm thá»­ pháº§n má»m (QA/Tester)', 'demo-viec-lam-16', 'Viáº¿t test case, kiá»ƒm thá»­ chá»©c nÄƒng web & mobile app, ghi nháº­n lá»—i trÃªn Jira.', 'Sinh viÃªn CNTT/HTTT, tÆ° duy tá»‰ má»‰, Ä‘á»‹nh hÆ°á»›ng QA/QC.', 'ÄÃ o táº¡o quy trÃ¬nh Agile thá»±c táº¿, cÆ¡ há»™i lÃªn chÃ­nh thá»©c khi ra trÆ°á»ng.', 'CÃ´ng nghá»‡', 'Internship', 3000000, 4200000, 'month', 'ÄÃ  Náºµng', 'Onsite', 'Ca sÃ¡ng (8h00â€“12h00)', 2, '2027-03-31', 'people.techstart@demo.stuwork.vn', 94, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000017', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Cá»™ng tÃ¡c viÃªn Minh há»a 2D & Sticker', 'demo-viec-lam-17', 'Váº½ bá»™ mascot vÃ  sticker minh há»a phong cÃ¡ch tráº» trung cho á»©ng dá»¥ng há»c táº­p.', 'Sá»­ dá»¥ng Procreate hoáº·c Illustrator, Ä‘áº£m báº£o tiáº¿n Ä‘á»™ phÃ¡c tháº£o.', 'Ghi tÃªn tÃ¡c giáº£ vÃ o há»“ sÆ¡ dá»± Ã¡n, há»£p Ä‘á»“ng cá»™ng tÃ¡c minh báº¡ch.', 'Thiáº¿t káº¿', 'Freelance', 300000, 600000, 'project', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Linh hoáº¡t', 2, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 117, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000018', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'NhÃ¢n viÃªn há»— trá»£ sá»± kiá»‡n Acoustic cuá»‘i tuáº§n', 'demo-viec-lam-18', 'SoÃ¡t mÃ£ Ä‘áº·t bÃ n online, hÆ°á»›ng dáº«n chá»— ngá»“i Ä‘Ãªm nháº¡c Acoustic sinh viÃªn.', 'Nhanh nháº¹n, giao tiáº¿p lá»‹ch thiá»‡p, lÃ m viá»‡c tá»‘i Thá»© 6 & Thá»© 7.', 'LÆ°Æ¡ng giá» cuá»‘i tuáº§n cao, há»— trá»£ Äƒn nháº¹ trÆ°á»›c ca.', 'Phá»¥c vá»¥', 'Part-time', 32000, 40000, 'hour', 'HÃ  Ná»™i', 'Onsite', 'Cuá»‘i tuáº§n', 3, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 84, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000019', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Cá»™ng tÃ¡c viÃªn TÆ° váº¥n khÃ³a há»c (KhÃ´ng Ã©p KPI)', 'demo-viec-lam-19', 'LiÃªn há»‡ há»c viÃªn Ä‘Ã£ Ä‘Äƒng kÃ½ form há»c thá»­ Ä‘á»ƒ xáº¿p lá»‹ch kiá»ƒm tra Ä‘áº§u vÃ o.', 'Giá»ng nÃ³i rÃµ rÃ ng, thÃ¢n thiá»‡n, biáº¿t láº¯ng nghe ngÆ°á»i há»c.', 'Data há»c viÃªn Ä‘Äƒng kÃ½ tháº­t 100%, thÆ°á»Ÿng thÃªm theo buá»•i test.', 'ChÄƒm sÃ³c khÃ¡ch hÃ ng', 'Part-time', 30000, 42000, 'hour', 'TP. Há»“ ChÃ­ Minh', 'Onsite', 'Ca chiá»u hoáº·c Ca tá»‘i', 3, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 67, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000020', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 'Cá»™ng tÃ¡c viÃªn Soáº¡n tháº£o tÃ i liá»‡u LaTeX / Word', 'demo-viec-lam-20', 'Chuyá»ƒn Ä‘á»•i phiáº¿u bÃ i táº­p ToÃ¡n â€“ LÃ½ sang Ä‘á»‹nh dáº¡ng Word Mathtype hoáº·c LaTeX.', 'Biáº¿t gÃµ cÃ´ng thá»©c toÃ¡n há»c chÃ­nh xÃ¡c, trÃ¬nh bÃ y khoa há»c.', 'LÃ m viá»‡c online hoÃ n toÃ n, nháº­n bÃ i theo tuáº§n linh hoáº¡t.', 'Cá»™ng tÃ¡c viÃªn', 'Remote', 28000, 38000, 'hour', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Linh hoáº¡t', 4, '2027-03-31', 'tuyendung.hoctot@demo.stuwork.vn', 105, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000021', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Cá»™ng tÃ¡c viÃªn Há»— trá»£ ká»¹ thuáº­t IT Helpdesk', 'demo-viec-lam-21', 'Há»— trá»£ cÃ i Ä‘áº·t pháº§n má»m vÃ  hÆ°á»›ng dáº«n sá»­ dá»¥ng thiáº¿t bá»‹ bÃ¡n hÃ ng cho khÃ¡ch.', 'Sinh viÃªn CNTT/Viá»…n thÃ´ng, náº¯m vá»¯ng Windows/macOS cÆ¡ báº£n.', 'RÃ¨n ká»¹ nÄƒng giao tiáº¿p khÃ¡ch hÃ ng doanh nghiá»‡p, phá»¥ cáº¥p Ä‘i láº¡i.', 'CÃ´ng nghá»‡', 'Part-time', 35000, 45000, 'hour', 'ÄÃ  Náºµng', 'Onsite', 'Ca chiá»u (13h30â€“17h30)', 2, '2027-03-31', 'people.techstart@demo.stuwork.vn', 69, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000022', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Quáº£n trá»‹ Fanpage & Cá»™ng Ä‘á»“ng Há»c thuáº­t', 'demo-viec-lam-22', 'Duyá»‡t bÃ i thÃ nh viÃªn theo quy táº¯c cá»™ng Ä‘á»“ng, ghim thÃ´ng bÃ¡o há»c bá»•ng.', 'Sá»­ dá»¥ng ngÃ´n tá»« chuáº©n má»±c, khÃ¡ch quan khi kiá»ƒm duyá»‡t ná»™i dung.', 'CÃ´ng viá»‡c lÃ¢u dÃ i, linh hoáº¡t thá»i gian mÃ¹a thi.', 'Marketing', 'Remote', 25000, 33000, 'hour', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Ca tá»‘i & Cuá»‘i tuáº§n', 2, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 131, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000023', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Thiáº¿t káº¿ Slide thuyáº¿t trÃ¬nh (PowerPoint / Canva)', 'demo-viec-lam-23', 'Chuáº©n hÃ³a bá»‘ cá»¥c, biá»ƒu Ä‘á»“ infographic cho bÃ i giáº£ng Ä‘iá»‡n tá»­ (15â€“25 slides).', 'ThÃ nh tháº¡o PowerPoint hoáº·c Canva Pro, tÆ° duy trÃ¬nh bÃ y trá»±c quan.', 'Cáº¥p sáºµn kho tÃ i nguyÃªn báº£n quyá»n, thanh toÃ¡n ngay theo bá»™ slide.', 'Thiáº¿t káº¿', 'Freelance', 120000, 250000, 'project', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Linh hoáº¡t', 4, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 148, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000024', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'NhÃ¢n viÃªn kiá»ƒm kho & trÆ°ng bÃ y sáº£n pháº©m', 'demo-viec-lam-24', 'Kiá»ƒm Ä‘áº¿m tá»“n kho báº±ng mÃ¡y quÃ©t mÃ£ váº¡ch vÃ  sáº¯p xáº¿p quáº§y trÆ°ng bÃ y theo chá»§ Ä‘á».', 'Gá»n gÃ ng, trung thá»±c, cÃ³ máº¯t tháº©m má»¹ sáº¯p xáº¿p.', 'KhÃ´ng gian lÃ m viá»‡c sÃ¡ng táº¡o, nghá»‰ linh hoáº¡t tuáº§n thi.', 'BÃ¡n hÃ ng', 'Part-time', 28000, 32000, 'hour', 'HÃ  Ná»™i', 'Onsite', 'Ca sÃ¡ng (8h30â€“12h30)', 2, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 61, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000025', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Gia sÆ° Láº­p trÃ¬nh Scratch & Python cÆ¡ báº£n', 'demo-viec-lam-25', 'HÆ°á»›ng dáº«n há»c sinh cáº¥p 2 lÃ m quen tÆ° duy thuáº­t toÃ¡n qua dá»± Ã¡n trÃ² chÆ¡i nhá».', 'Sinh viÃªn CNTT hoáº·c SÆ° pháº¡m Tin, truyá»n Ä‘áº¡t sinh Ä‘á»™ng.', 'ThÃ¹ lao háº¥p dáº«n trÃªn 55.000Ä‘/giá», giÃ¡o trÃ¬nh STEM cÃ³ sáºµn.', 'Gia sÆ°', 'Part-time', 55000, 75000, 'hour', 'TP. Há»“ ChÃ­ Minh', 'Hybrid', 'Cuá»‘i tuáº§n', 3, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 119, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000026', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000001'), 'NhÃ¢n viÃªn trá»±c quáº§y bÃ¡nh ngá»t & trÃ  chiá»u', 'demo-viec-lam-26', 'Báº£o quáº£n tá»§ bÃ¡nh ngá»t, Ä‘Ã³ng há»™p mang Ä‘i vÃ  giá»›i thiá»‡u combo trÃ  bÃ¡nh.', 'Nháº¹ nhÃ ng, sáº¡ch sáº½, phÃ¹ há»£p sinh viÃªn nÄƒm 1â€“2.', 'Há»— trá»£ gá»­i xe miá»…n phÃ­, thÆ°á»Ÿng doanh thu cuá»‘i thÃ¡ng.', 'Phá»¥c vá»¥', 'Part-time', 23000, 25000, 'hour', 'Thanh XuÃ¢n, HÃ  Ná»™i', 'Onsite', 'Ca chiá»u (13h00â€“17h00)', 2, '2027-03-31', 'hr.cafemoc@demo.stuwork.vn', 77, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000027', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 'Cá»™ng tÃ¡c viÃªn Dá»‹ch thuáº­t phá»¥ Ä‘á» Anh â€“ Viá»‡t', 'demo-viec-lam-27', 'Dá»‹ch vÃ  cÄƒn chá»‰nh phá»¥ Ä‘á» cÃ¡c video khoa há»c thÆ°á»ng thá»©c dÃ i 8â€“12 phÃºt.', 'Nghe Ä‘á»c tiáº¿ng Anh tá»‘t (IELTS 6.5+), diá»…n Ä‘áº¡t tiáº¿ng Viá»‡t tá»± nhiÃªn.', 'LÃ m viá»‡c táº¡i nhÃ  100%, má»Ÿ rá»™ng vá»‘n tá»« há»c thuáº­t.', 'Cá»™ng tÃ¡c viÃªn', 'Freelance', 45000, 65000, 'hour', 'LÃ m viá»‡c tá»« xa', 'Remote', 'Linh hoáº¡t', 3, '2027-03-31', 'talent.medialab@demo.stuwork.vn', 162, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000028', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000006'), 'Thá»±c táº­p sinh PhÃ¢n tÃ­ch dá»¯ liá»‡u (Data Analyst Intern)', 'demo-viec-lam-28', 'XÃ¢y dá»±ng dashboard theo dÃµi chá»‰ sá»‘ váº­n hÃ nh báº±ng SQL vÃ  Power BI cÃ¹ng Ä‘á»™i Product.', 'Sinh viÃªn nÄƒm cuá»‘i ngÃ nh HTTT quáº£n lÃ½ hoáº·c Khoa há»c dá»¯ liá»‡u; náº¯m vá»¯ng SQL.', 'Má»©c lÆ°Æ¡ng thá»a thuáº­n theo nÄƒng lá»±c, mentor trá»±c tiáº¿p tá»« trÆ°á»Ÿng nhÃ³m.', 'CÃ´ng nghá»‡', 'Full-time', NULL, NULL, 'month', 'HÃ  Ná»™i', 'Hybrid', 'Linh hoáº¡t', 1, '2027-03-31', 'people.techstart@demo.stuwork.vn', 140, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000029', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000005'), 'Äiá»u phá»‘i viÃªn CLB Tiáº¿ng Anh cuá»‘i tuáº§n', 'demo-viec-lam-29', 'Dáº«n dáº¯t trÃ² chÆ¡i káº¿t ná»‘i vÃ  chia nhÃ³m tháº£o luáº­n tiáº¿ng Anh sÃ¡ng Chá»§ nháº­t.', 'Tá»± tin Ä‘á»©ng trÆ°á»›c Ä‘Ã¡m Ä‘Ã´ng, tiáº¿ng Anh giao tiáº¿p trÃ´i cháº£y.', 'Chá»©ng nháº­n Ä‘iá»u phá»‘i viÃªn hoáº¡t Ä‘á»™ng ngoáº¡i khÃ³a.', 'Cá»™ng tÃ¡c viÃªn', 'Part-time', 35000, 45000, 'hour', 'ÄÃ  Náºµng', 'Onsite', 'Cuá»‘i tuáº§n', 2, '2027-03-31', 'careers.eduplus@demo.stuwork.vn', 82, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000030', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000008'), 'Trá»£ lÃ½ Chá»¥p áº£nh sáº£n pháº©m Lifestyle', 'demo-viec-lam-30', 'Há»— trá»£ chuáº©n bá»‹ Ä‘áº¡o cá»¥, Ã¡nh sÃ¡ng cÆ¡ báº£n vÃ  chá»¥p háº­u trÆ°á»ng táº¡i studio.', 'YÃªu thÃ­ch nhiáº¿p áº£nh vÃ  styling sáº£n pháº©m, nhanh nháº¹n.', 'Há»c thá»±c chiáº¿n Ã¡nh sÃ¡ng studio miá»…n phÃ­, bao Äƒn trÆ°a ngÃ y chá»¥p.', 'Thiáº¿t káº¿', 'Part-time', 35000, 50000, 'hour', 'TP. Há»“ ChÃ­ Minh', 'Onsite', 'Ca sÃ¡ng hoáº·c Ca chiá»u', 2, '2027-03-31', 'hello.creativestudio@demo.stuwork.vn', 95, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000031', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000004'), 'ChÄƒm sÃ³c khÃ¡ch hÃ ng Gian hÃ ng Shopee / Lazada', 'demo-viec-lam-31', 'TÆ° váº¥n kÃ­ch thÆ°á»›c sáº£n pháº©m, há»— trá»£ Ä‘á»•i tráº£ minh báº¡ch trÃªn khung chat sÃ n TMÄT.', 'Pháº£n há»“i tin nháº¯n nhanh, lá»‹ch sá»±, cÃ³ laptop cÃ¡ nhÃ¢n.', 'PhÃ¹ há»£p sinh viÃªn táº¡i cÃ¡c tá»‰nh thÃ nh khÃ¡c lÃ m tá»« xa.', 'ChÄƒm sÃ³c khÃ¡ch hÃ ng', 'Part-time', 24000, 28000, 'hour', 'CÃ¡c tá»‰nh thÃ nh khÃ¡c', 'Remote', 'Ca sÃ¡ng hoáº·c Ca tá»‘i', 3, '2027-03-31', 'hr.localstore@demo.stuwork.vn', 108, 'active', TRUE),
  ('30000000-0000-4000-8000-000000000032', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000007'), 'NhÃ¢n viÃªn chuáº©n bá»‹ pháº§n Äƒn Salad buá»•i sÃ¡ng', 'demo-viec-lam-32', 'SÆ¡ cháº¿ rau cá»§ sáº¡ch, Ä‘á»‹nh lÆ°á»£ng kháº©u pháº§n salad há»™p buá»•i sÃ¡ng cá»§a Fresh Food Demo.', 'ÄÃºng giá», Ä‘áº£m báº£o vá»‡ sinh an toÃ n thá»±c pháº©m.', 'Táº·ng 1 pháº§n Äƒn healthy má»—i ca lÃ m viá»‡c.', 'Phá»¥c vá»¥', 'Part-time', 28000, 33000, 'hour', 'Quáº­n 1, TP. Há»“ ChÃ­ Minh', 'Onsite', 'Ca sÃ¡ng (6h30â€“10h30)', 3, '2027-03-31', 'hr.freshfood@demo.stuwork.vn', 15, 'pending', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  status = EXCLUDED.status,
  is_demo = TRUE;

-- 5. ChÃ¨n 16 ÄÆ¡n á»©ng tuyá»ƒn Demo Ä‘a tráº¡ng thÃ¡i (Pending, Reviewed, Shortlisted, Accepted, Rejected)
INSERT INTO public.applications (id, job_id, student_id, cover_letter, relevant_experience, available_time, status, employer_note)
VALUES
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'Em lÃ  Nguyá»…n Minh Anh, sinh viÃªn nÄƒm 3 ngÃ nh Marketing, Ä‘Ã£ cÃ³ 6 thÃ¡ng viáº¿t bÃ i fanpage.', '6 thÃ¡ng CTV ná»™i dung CLB Truyá»n thÃ´ng', 'Ca tá»‘i, Linh hoáº¡t', 'accepted', 'BÃ i viáº¿t thá»­ máº¡ch láº¡c, thÃ¡i Ä‘á»™ chuyÃªn nghiá»‡p.'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000001', 'Em mong muá»‘n thá»±c táº­p vá»‹ trÃ­ Marketing máº¡ng xÃ£ há»™i Ä‘á»ƒ phÃ¡t triá»ƒn ká»¹ nÄƒng láº­p káº¿ hoáº¡ch.', '6 thÃ¡ng CTV ná»™i dung', 'Ca sÃ¡ng & chiá»u linh hoáº¡t', 'shortlisted', 'Háº¹n phá»ng váº¥n online chiá»u Thá»© 5.'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Em lÃ  Tráº§n Äá»©c Minh, sinh viÃªn CNTT BÃ¡ch khoa, tá»«ng kÃ¨m há»c sinh lá»›p 9 Ä‘áº¡t 8.5 ToÃ¡n.', '1 nÄƒm kÃ¨m ToÃ¡n lá»›p 9', 'Ca tá»‘i', 'accepted', 'Kiáº¿n thá»©c vá»¯ng, truyá»n Ä‘áº¡t rÃµ rÃ ng.'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', 'Em gá»­i há»“ sÆ¡ á»©ng tuyá»ƒn Thá»±c táº­p sinh Frontend Next.js/React.', '2 dá»± Ã¡n mÃ´n há»c React/TS', 'Ca chiá»u', 'reviewed', 'ÄÃ£ xem GitHub demo, chá» nhÃ³m ká»¹ thuáº­t Ä‘Ã¡nh giÃ¡.'),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', 'Em cÃ³ IELTS 7.5 vÃ  4 thÃ¡ng trá»£ giáº£ng thiáº¿u nhi.', '4 thÃ¡ng trá»£ giáº£ng', 'Ca tá»‘i & Cuá»‘i tuáº§n', 'accepted', 'PhÃ¡t Ã¢m ráº¥t tá»‘t, phÃ¹ há»£p lá»›p cuá»‘i tuáº§n.'),
  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000003', 'Em cÃ³ thá»ƒ nháº­n lá»›p Gia sÆ° Tiáº¿ng Anh tá»‘i Thá»© 2 vÃ  Thá»© 4.', 'IELTS 7.5', 'Ca tá»‘i', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', 'Em cÃ³ thá»ƒ Ä‘i lÃ m Ä‘á»u Ä‘áº·n ca sÃ¡ng cÃ¡c ngÃ y trong tuáº§n táº¡i Cafe Má»™c Demo.', '3 thÃ¡ng bÃ¡n hÃ ng part-time', 'Ca sÃ¡ng', 'shortlisted', 'Má»i qua quÃ¡n trao Ä‘á»•i lá»‹ch ca.'),
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004', 'Em giao tiáº¿p thÃ¢n thiá»‡n vÃ  sá»­ dá»¥ng tá»‘t pháº§n má»m bÃ¡n hÃ ng.', '3 thÃ¡ng bÃ¡n hÃ ng', 'Cuá»‘i tuáº§n', 'accepted', 'ÄÃ£ nháº­n thá»­ viá»‡c cuá»‘i tuáº§n nÃ y.'),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000005', 'Em gá»­i kÃ¨m link Portfolio cÃ¡c áº¥n pháº©m social media Ä‘Ã£ thá»±c hiá»‡n.', 'Freelance cho 5 fanpage', 'Linh hoáº¡t', 'accepted', 'Gu tháº©m má»¹ hiá»‡n Ä‘áº¡i.'),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000005', 'Em hÃ o há»©ng vá»›i dá»± Ã¡n váº½ bá»™ sticker sinh viÃªn trÃªn Procreate.', 'Minh há»a 2D', 'Linh hoáº¡t', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000006', 'Em lÃ  sinh viÃªn nÄƒm 4 Ká»¹ thuáº­t pháº§n má»m, Ä‘Ã£ cÃ³ kinh nghiá»‡m viáº¿t test case.', '3 thÃ¡ng thá»±c táº­p QA phÃ²ng lab', 'Ca sÃ¡ng', 'shortlisted', 'Má»i phá»ng váº¥n sÃ¡ng Thá»© 3.'),
  ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000021', '20000000-0000-4000-8000-000000000006', 'Em cÃ³ thá»ƒ há»— trá»£ ká»¹ thuáº­t ca chiá»u táº¡i khu vá»±c Háº£i ChÃ¢u.', 'Ká»¹ thuáº­t mÃ¡y tÃ­nh', 'Ca chiá»u', 'reviewed', 'Äang cÃ¢n nháº¯c lá»‹ch ca chiá»u.'),
  ('40000000-0000-4000-8000-000000000013', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000007', 'Em lÃ  sinh viÃªn BÃ¡o chÃ­ nÄƒm 2, mong muá»‘n cá»™ng tÃ¡c viáº¿t bÃ i.', 'Báº£n tin sinh viÃªn', 'Linh hoáº¡t', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000014', '30000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000007', 'Em á»©ng tuyá»ƒn vá»‹ trÃ­ quay dá»±ng clip ngáº¯n cuá»‘i tuáº§n.', 'Dá»±ng CapCut cÆ¡ báº£n', 'Cuá»‘i tuáº§n', 'rejected', 'Äá»£t tuyá»ƒn nÃ y Æ°u tiÃªn á»©ng viÃªn cÃ³ sáºµn mic thu Ã¢m rá»i.'),
  ('40000000-0000-4000-8000-000000000015', '30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000008', 'Em ráº¥t yÃªu thÃ­ch pha cháº¿ Ä‘á»“ uá»‘ng vÃ  mong Ä‘Æ°á»£c há»c nghá» Barista.', 'Háº­u cáº§n sá»± kiá»‡n', 'Ca chiá»u', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000016', '30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000010', 'Em thÃ nh tháº¡o Google Sheets vÃ  cam káº¿t 12 giá»/tuáº§n.', '4 thÃ¡ng trá»±c gian hÃ ng', 'Linh hoáº¡t', 'accepted', 'BÃ i test nháº­p liá»‡u Ä‘áº¡t 99% chÃ­nh xÃ¡c.'),
  ('40000000-0000-4000-8000-000000000017', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Em Ä‘Äƒng kÃ½ á»©ng tuyá»ƒn ca tá»‘i vÃ  cuá»‘i tuáº§n táº¡i Cafe Má»™c Demo.', '6 thÃ¡ng CTV truyá»n thÃ´ng', 'Ca tá»‘i & Cuá»‘i tuáº§n', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000018', '30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', 'Em sá»­ dá»¥ng thÃ nh tháº¡o Canva Pro vÃ  Illustrator cÆ¡ báº£n.', 'Thiáº¿t káº¿ áº¥n pháº©m CLB', 'Linh hoáº¡t', 'pending', NULL),
  ('40000000-0000-4000-8000-000000000019', '30000000-0000-4000-8000-000000000022', '20000000-0000-4000-8000-000000000001', 'Em Ä‘Ã£ cÃ³ kinh nghiá»‡m quáº£n trá»‹ fanpage CLB sinh viÃªn.', 'Quáº£n trá»‹ fanpage 15.000 thÃ nh viÃªn', 'Ca tá»‘i', 'reviewed', 'Há»“ sÆ¡ phÃ¹ há»£p, bá»™ pháº­n NhÃ¢n sá»± Ä‘ang xáº¿p lá»‹ch trao Ä‘á»•i.'),
  ('40000000-0000-4000-8000-000000000020', '30000000-0000-4000-8000-000000000023', '20000000-0000-4000-8000-000000000001', 'Em gá»­i há»“ sÆ¡ á»©ng tuyá»ƒn vá»‹ trÃ­ thiáº¿t káº¿ Slide thuyáº¿t trÃ¬nh.', 'Thiáº¿t káº¿ slide bÃ i giáº£ng', 'Linh hoáº¡t', 'rejected', 'Äá»£t tuyá»ƒn nÃ y Ä‘Ã£ Ä‘á»§ sá»‘ lÆ°á»£ng cá»™ng tÃ¡c viÃªn.')
ON CONFLICT (job_id, student_id) DO UPDATE SET
  status = EXCLUDED.status,
  employer_note = EXCLUDED.employer_note;

-- 6. CÃ´ng viá»‡c Ä‘Ã£ lÆ°u, YÃªu cáº§u xÃ¡c minh, BÃ¡o cÃ¡o, ÄÃ¡nh giÃ¡ & ThÃ´ng bÃ¡o Demo
INSERT INTO public.saved_jobs (id, student_id, job_id)
VALUES
  ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('50000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000007'),
  ('50000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000025')
ON CONFLICT (student_id, job_id) DO NOTHING;

INSERT INTO public.verification_requests (id, employer_id, business_name, representative_name, address, tax_code, website, contact_email, contact_phone, status, admin_note)
VALUES
  ('60000000-0000-4000-8000-000000000001', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000007'), 'Há»‡ thá»‘ng Thá»±c pháº©m sáº¡ch Fresh Food Demo', 'HoÃ ng Thu Trang', 'Sá»‘ 56 Nguyá»…n Thá»‹ Minh Khai, Quáº­n 1, TP.HCM (Giáº£ láº­p)', '0319998887-DEMO', 'https://freshfood.demo.stuwork.vn', 'hr.freshfood@demo.stuwork.vn', '0900100007', 'pending', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.job_reports (id, job_id, reporter_id, reason, description, status, admin_note)
VALUES
  ('70000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000031', '20000000-0000-4000-8000-000000000004', 'MÃ´ táº£ cÃ´ng viá»‡c khÃ´ng Ä‘Ãºng thá»±c táº¿', '(BÃ¡o cÃ¡o minh há»a Demo) Äá» nghá»‹ kiá»ƒm tra láº¡i khung giá» bÃ n giao ca tá»‘i.', 'pending', NULL),
  ('70000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000007', 'ThÃ´ng tin nhÃ  tuyá»ƒn dá»¥ng Ä‘Ã¡ng ngá»', '(BÃ¡o cÃ¡o minh há»a Demo) XÃ¡c nháº­n quy trÃ¬nh kÃ½ thá»a thuáº­n CTV tá»« xa.', 'resolved', 'ÄÃ£ Ä‘á»‘i chiáº¿u vá»›i TechStart Demo: hoÃ n toÃ n minh báº¡ch, khÃ´ng thu phÃ­.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, job_id, student_id, employer_id, rating, comment)
VALUES
  ('80000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000003'), 5, 'Anh chá»‹ biÃªn táº­p táº¡i Media Lab Demo hÆ°á»›ng dáº«n táº­n tÃ¬nh, tráº£ nhuáº­n bÃºt Ä‘Ãºng háº¹n.'),
  ('80000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', (SELECT id FROM public.employer_profiles WHERE user_id='10000000-0000-4000-8000-000000000002'), 5, 'Trung tÃ¢m Há»c Tá»‘t Demo chuáº©n bá»‹ giÃ¡o Ã¡n bÃ i báº£n, khÃ´ng thu báº¥t ká»³ phÃ­ nháº­n lá»›p nÃ o.')
ON CONFLICT (job_id, student_id) DO NOTHING;

INSERT INTO public.notifications (id, user_id, title, message, type, is_read, link)
VALUES
  ('90000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Há»“ sÆ¡ Ä‘Æ°á»£c cháº¥p nháº­n!', 'Media Lab Demo Ä‘Ã£ cháº¥p nháº­n Ä‘Æ¡n á»©ng tuyá»ƒn vá»‹ trÃ­ CTV viáº¿t ná»™i dung chuáº©n SEO.', 'application_status', FALSE, '/student/applications'),
  ('90000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'CÃ³ á»©ng viÃªn má»›i á»©ng tuyá»ƒn', 'BÃ¹i Tuáº¥n Kiá»‡t vá»«a gá»­i há»“ sÆ¡ á»©ng tuyá»ƒn vÃ o vá»‹ trÃ­ NhÃ¢n viÃªn pha cháº¿.', 'new_applicant', FALSE, '/employer/applications'),
  ('90000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'YÃªu cáº§u xÃ¡c minh má»›i', 'Fresh Food Demo vá»«a gá»­i há»“ sÆ¡ yÃªu cáº§u xÃ¡c minh Ä‘Æ¡n vá»‹ tuyá»ƒn dá»¥ng.', 'verification_approved', FALSE, '/admin/verifications')
ON CONFLICT (id) DO NOTHING;

COMMIT;


import "server-only";
import { cookies } from "next/headers";
import type {
  AdminLog,
  AppNotification,
  Application,
  EmployerProfile,
  Job,
  JobFilterParams,
  JobReport,
  Profile,
  Review,
  SavedJob,
  StudentProfile,
  VerificationRequest,
} from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readSandboxDb, SANDBOX_SESSION_COOKIE } from "./local-sandbox-store";
import { computeJobMatch, normalizeJobHourlyRate } from "./recommendation";

export interface AuthSessionContext {
  user: Profile | null;
  studentProfile: StudentProfile | null;
  employerProfile: EmployerProfile | null;
  unreadNotifications: number;
  isCloudMode: boolean;
}

/**
 * Đọc phiên đăng nhập hiện tại và hồ sơ vai trò tương ứng từ Server
 */
export async function getCurrentAuthContext(): Promise<AuthSessionContext> {
  const cloud = isSupabaseConfigured();

  if (cloud) {
    try {
      const supabase = await createSupabaseServerClient();
      if (!supabase) {
        return {
          user: null,
          studentProfile: null,
          employerProfile: null,
          unreadNotifications: 0,
          isCloudMode: true,
        };
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return {
          user: null,
          studentProfile: null,
          employerProfile: null,
          unreadNotifications: 0,
          isCloudMode: true,
        };
      }

      const [{ data: profile }, { count: unreadCount }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", authUser.id)
          .eq("is_read", false),
      ]);

      if (!profile || !profile.is_active) {
        return {
          user: null,
          studentProfile: null,
          employerProfile: null,
          unreadNotifications: 0,
          isCloudMode: true,
        };
      }

      let studentProfile: StudentProfile | null = null;
      let employerProfile: EmployerProfile | null = null;

      if (profile.role === "student") {
        const { data } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", profile.id)
          .maybeSingle();
        studentProfile = (data as StudentProfile | null) ?? null;
      } else if (profile.role === "employer") {
        const { data } = await supabase
          .from("employer_profiles")
          .select("*")
          .eq("user_id", profile.id)
          .maybeSingle();
        employerProfile = (data as EmployerProfile | null) ?? null;
      }

      return {
        user: profile as Profile,
        studentProfile,
        employerProfile,
        unreadNotifications: unreadCount ?? 0,
        isCloudMode: true,
      };
    } catch {
      return {
        user: null,
        studentProfile: null,
        employerProfile: null,
        unreadNotifications: 0,
        isCloudMode: true,
      };
    }
  }

  // Chế độ Local Sandbox khi chưa gắn biến môi trường Supabase
  const cookieStore = await cookies();
  const uid = cookieStore.get(SANDBOX_SESSION_COOKIE)?.value;
  if (!uid) {
    return {
      user: null,
      studentProfile: null,
      employerProfile: null,
      unreadNotifications: 0,
      isCloudMode: false,
    };
  }

  const db = readSandboxDb();
  const user = db.profiles.find((p) => p.id === uid && p.is_active) ?? null;
  if (!user) {
    return {
      user: null,
      studentProfile: null,
      employerProfile: null,
      unreadNotifications: 0,
      isCloudMode: false,
    };
  }

  const studentProfile =
    user.role === "student"
      ? db.student_profiles.find((s) => s.user_id === user.id) ?? null
      : null;
  const employerProfile =
    user.role === "employer"
      ? db.employer_profiles.find((e) => e.user_id === user.id) ?? null
      : null;
  const unreadNotifications = db.notifications.filter(
    (n) => n.user_id === user.id && !n.is_read
  ).length;

  return {
    user,
    studentProfile,
    employerProfile,
    unreadNotifications,
    isCloudMode: false,
  };
}

/**
 * Thống kê trang chủ & danh sách việc làm nổi bật + gợi ý
 */
export async function getHomePageData(studentProfile?: StudentProfile | null) {
  const { jobs: allActiveJobs } = await queryJobs(
    { limit: 40, sort: "newest" },
    studentProfile
  );

  let totalStudents = 0;
  let totalEmployers = 0;
  let verifiedJobsCount = 0;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const [{ count: empCount }, { data: activeWithEmp }] = await Promise.all([
          supabase
            .from("employer_profiles")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("jobs")
            .select("id, employer:employer_profiles(verification_status)")
            .eq("status", "active"),
        ]);
        totalEmployers = empCount ?? 8;
        verifiedJobsCount = (activeWithEmp || []).filter((j: unknown) => {
          const rec = j as { employer?: { verification_status?: string } | Array<{ verification_status?: string }> };
          const emp = Array.isArray(rec.employer) ? rec.employer[0] : rec.employer;
          return emp?.verification_status === "verified";
        }).length;
        // profiles có RLS bảo vệ thông tin sinh viên với khách chưa đăng nhập -> dùng ước tính an toàn nếu count trả 0
        const { count: stuCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student");
        totalStudents = stuCount && stuCount > 0 ? stuCount : 10;
      }
    } catch {
      totalStudents = 10;
      totalEmployers = 8;
    }
  } else {
    const db = readSandboxDb();
    totalStudents = db.profiles.filter((p) => p.role === "student").length;
    totalEmployers = db.employer_profiles.length;
    const verifiedEmployerIds = new Set(
      db.employer_profiles
        .filter((e) => e.verification_status === "verified")
        .map((e) => e.id)
    );
    verifiedJobsCount = db.jobs.filter(
      (j) => j.status === "active" && verifiedEmployerIds.has(j.employer_id)
    ).length;
  }

  const featuredJobs = allActiveJobs.slice(0, 8);
  const recommendedJobs = [...allActiveJobs]
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 4);

  return {
    stats: {
      activeJobs: allActiveJobs.length,
      totalStudents,
      totalEmployers,
      verifiedJobs: verifiedJobsCount || featuredJobs.length,
    },
    featuredJobs,
    recommendedJobs,
  };
}

/**
 * Tìm kiếm, lọc kết hợp nhiều tiêu chí và sắp xếp danh sách việc làm
 */
export async function queryJobs(
  params: JobFilterParams = {},
  studentProfile?: StudentProfile | null
): Promise<{
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  connectionError?: string;
}> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(params.limit) || 9));
  let rawJobs: Job[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (!supabase) throw new Error("Không khởi tạo được kết nối Supabase.");

      let query = supabase
        .from("jobs")
        .select("*, employer:employer_profiles(*)")
        .eq("status", "active");

      if (params.job_type) {
        query = query.eq("job_type", params.job_type);
      }
      if (params.category) {
        query = query.eq("category", params.category);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) {
        return {
          jobs: [],
          total: 0,
          page,
          totalPages: 1,
          connectionError:
            "Không thể tải danh sách việc làm từ cơ sở dữ liệu lúc này. Vui lòng thử lại sau ít phút.",
        };
      }

      rawJobs = (data || []).map((row: Record<string, unknown>) => {
        const emp = Array.isArray(row.employer) ? row.employer[0] : row.employer;
        return {
          ...(row as unknown as Job),
          employer: emp as EmployerProfile | undefined,
        };
      });
    } catch {
      return {
        jobs: [],
        total: 0,
        page,
        totalPages: 1,
        connectionError:
          "Kết nối tới máy chủ dữ liệu bị gián đoạn. Vui lòng kiểm tra kết nối mạng.",
      };
    }
  } else {
    const db = readSandboxDb();
    const empMap = new Map(db.employer_profiles.map((e) => [e.id, e]));
    rawJobs = db.jobs
      .filter((j) => j.status === "active")
      .map((j) => ({
        ...j,
        employer: empMap.get(j.employer_id),
      }));
  }

  // Kết hợp toàn bộ các bộ lọc (Từ khóa, Loại việc, Danh mục, Mức lương, Địa điểm, Thời gian, Xác minh)
  const q = (params.q || "").trim().toLowerCase();
  const filtered = rawJobs.filter((job) => {
    if (q) {
      const searchable = [
        job.title,
        job.employer?.company_name || "",
        job.description,
        job.category,
        job.location,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (params.job_type && job.job_type !== params.job_type) {
      return false;
    }

    if (params.category && job.category !== params.category) {
      return false;
    }

    if (params.verified_only && job.employer?.verification_status !== "verified") {
      return false;
    }

    if (params.location) {
      const locFilter = params.location.toLowerCase();
      const jobLoc = job.location.toLowerCase();
      if (locFilter === "làm việc từ xa") {
        if (job.work_mode !== "Remote" && !jobLoc.includes("từ xa")) return false;
      } else if (locFilter === "các tỉnh thành khác") {
        const majorCities = ["hà nội", "hồ chí minh", "đà nẵng", "từ xa"];
        if (majorCities.some((c) => jobLoc.includes(c)) && !jobLoc.includes("tỉnh thành khác")) {
          return false;
        }
      } else if (!jobLoc.includes(locFilter)) {
        return false;
      }
    }

    if (params.working_time) {
      const wtFilter = params.working_time.toLowerCase();
      if (!job.working_time.toLowerCase().includes(wtFilter)) {
        return false;
      }
    }

    if (params.salary_range) {
      const hourly = normalizeJobHourlyRate(job);
      switch (params.salary_range) {
        case "negotiable":
          if (job.salary_min != null || job.salary_max != null) return false;
          break;
        case "under_25k":
          if (hourly == null || hourly >= 25000) return false;
          break;
        case "25k_35k":
          if (hourly == null || hourly < 25000 || hourly > 35000) return false;
          break;
        case "35k_50k":
          if (hourly == null || hourly <= 35000 || hourly > 50000) return false;
          break;
        case "over_50k":
          if (hourly == null || hourly <= 50000) return false;
          break;
      }
    }

    return true;
  });

  // Gắn điểm phù hợp
  const enriched = filtered.map((job) => {
    const match = computeJobMatch(job, studentProfile);
    return {
      ...job,
      match_score: match.score,
      match_reasons: match.reasons,
    };
  });

  // Sắp xếp theo lựa chọn
  const sortMode = params.sort || "newest";
  enriched.sort((a, b) => {
    if (sortMode === "salary_desc") {
      const rateA = normalizeJobHourlyRate(a) ?? 0;
      const rateB = normalizeJobHourlyRate(b) ?? 0;
      return rateB - rateA;
    }
    if (sortMode === "best_match") {
      return (b.match_score ?? 0) - (a.match_score ?? 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const total = enriched.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  return {
    jobs: enriched.slice(start, start + limit),
    total,
    page: safePage,
    totalPages,
  };
}

/**
 * Chi tiết 1 tin tuyển dụng kèm trạng thái đã lưu / đã ứng tuyển / đánh giá
 */
export async function getJobDetailById(jobId: string, currentUser?: Profile | null) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data: row } = await supabase
      .from("jobs")
      .select("*, employer:employer_profiles(*)")
      .eq("id", jobId)
      .maybeSingle();

    if (!row) return null;
    const emp = Array.isArray(row.employer) ? row.employer[0] : row.employer;
    const job: Job = { ...(row as unknown as Job), employer: emp };

    // Tăng lượt xem nhẹ nhàng
    await supabase
      .from("jobs")
      .update({ views_count: (job.views_count || 0) + 1 })
      .eq("id", job.id);

    const [{ data: reviewsData }, { data: relatedData }] = await Promise.all([
      supabase
        .from("reviews")
        .select("*")
        .eq("job_id", job.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("*, employer:employer_profiles(*)")
        .eq("status", "active")
        .eq("category", job.category)
        .neq("id", job.id)
        .limit(3),
    ]);

    let existingApplication: Application | null = null;
    let isSaved = false;
    let hasReviewed = false;

    if (currentUser?.role === "student") {
      const [{ data: appRow }, { data: savedRow }, { data: revRow }] =
        await Promise.all([
          supabase
            .from("applications")
            .select("*")
            .eq("job_id", job.id)
            .eq("student_id", currentUser.id)
            .maybeSingle(),
          supabase
            .from("saved_jobs")
            .select("id")
            .eq("job_id", job.id)
            .eq("student_id", currentUser.id)
            .maybeSingle(),
          supabase
            .from("reviews")
            .select("id")
            .eq("job_id", job.id)
            .eq("student_id", currentUser.id)
            .maybeSingle(),
        ]);

      existingApplication = (appRow as Application | null) ?? null;
      isSaved = Boolean(savedRow);
      hasReviewed = Boolean(revRow);
    }

    return {
      job,
      reviews: (reviewsData || []) as Review[],
      existingApplication,
      isSaved,
      canReview: existingApplication?.status === "accepted" && !hasReviewed,
      relatedJobs: (relatedData || []).map((r: Record<string, unknown>) => ({
        ...(r as unknown as Job),
        employer: Array.isArray(r.employer) ? r.employer[0] : r.employer,
      })) as Job[],
    };
  }

  const db = readSandboxDb();
  const jobRaw = db.jobs.find((j) => j.id === jobId);
  if (!jobRaw) return null;

  const employer = db.employer_profiles.find((e) => e.id === jobRaw.employer_id);
  const isOwner =
    currentUser?.role === "employer" && employer?.user_id === currentUser.id;
  const isAdmin = currentUser?.role === "admin";

  if (jobRaw.status !== "active" && !isOwner && !isAdmin) {
    return null;
  }

  const job: Job = { ...jobRaw, employer };
  const reviews: Review[] = db.reviews
    .filter((r) => r.job_id === job.id)
    .map((r) => {
      const stu = db.profiles.find((p) => p.id === r.student_id);
      return {
        ...r,
        student: stu
          ? { id: stu.id, full_name: stu.full_name, avatar_url: stu.avatar_url }
          : undefined,
      };
    });

  const existingApplication =
    currentUser?.role === "student"
      ? db.applications.find(
          (a) => a.job_id === job.id && a.student_id === currentUser.id
        ) ?? null
      : null;

  const isSaved =
    currentUser?.role === "student"
      ? db.saved_jobs.some(
          (s) => s.job_id === job.id && s.student_id === currentUser.id
        )
      : false;

  const hasReviewed =
    currentUser?.role === "student"
      ? db.reviews.some(
          (r) => r.job_id === job.id && r.student_id === currentUser.id
        )
      : false;

  const relatedJobs = db.jobs
    .filter(
      (j) => j.status === "active" && j.category === job.category && j.id !== job.id
    )
    .slice(0, 3)
    .map((j) => ({
      ...j,
      employer: db.employer_profiles.find((e) => e.id === j.employer_id),
    }));

  return {
    job,
    reviews,
    existingApplication,
    isSaved,
    canReview: existingApplication?.status === "accepted" && !hasReviewed,
    relatedJobs,
  };
}

/**
 * Dữ liệu tổng hợp cho cổng Sinh viên
 */
export async function getStudentPortalData(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const [{ data: studentProfile }, { data: apps }, { data: saved }] =
      await Promise.all([
        supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("applications")
          .select("*, job:jobs(*, employer:employer_profiles(*))")
          .eq("student_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_jobs")
          .select("*, job:jobs(*, employer:employer_profiles(*))")
          .eq("student_id", userId)
          .order("created_at", { ascending: false }),
      ]);

    const { jobs: recommendedJobs } = await queryJobs(
      { sort: "best_match", limit: 6 },
      studentProfile as StudentProfile | null
    );

    return {
      studentProfile: (studentProfile as StudentProfile | null) ?? null,
      applications: (apps || []) as Application[],
      savedJobs: (saved || []) as SavedJob[],
      recommendedJobs,
    };
  }

  const db = readSandboxDb();
  const empMap = new Map(db.employer_profiles.map((e) => [e.id, e]));
  const jobMap = new Map(
    db.jobs.map((j) => [j.id, { ...j, employer: empMap.get(j.employer_id) }])
  );

  const studentProfile =
    db.student_profiles.find((s) => s.user_id === userId) ?? null;

  const applications: Application[] = db.applications
    .filter((a) => a.student_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((a) => ({
      ...a,
      job: jobMap.get(a.job_id),
    }));

  const savedJobs: SavedJob[] = db.saved_jobs
    .filter((s) => s.student_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((s) => ({
      ...s,
      job: jobMap.get(s.job_id),
    }))
    .filter((s) => Boolean(s.job));

  const { jobs: recommendedJobs } = await queryJobs(
    { sort: "best_match", limit: 6 },
    studentProfile
  );

  return {
    studentProfile,
    applications,
    savedJobs,
    recommendedJobs,
  };
}

/**
 * Dữ liệu tổng hợp cho cổng Nhà tuyển dụng
 */
export async function getEmployerPortalData(userId: string) {
  let employerProfile: EmployerProfile | null = null;
  let jobs: Job[] = [];
  let applications: Application[] = [];
  let verifications: VerificationRequest[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data: emp } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!emp) return null;
    employerProfile = emp as EmployerProfile;

    const [{ data: jobRows }, { data: verRows }] = await Promise.all([
      supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", employerProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("verification_requests")
        .select("*")
        .eq("employer_id", employerProfile.id)
        .order("created_at", { ascending: false }),
    ]);

    jobs = (jobRows || []) as Job[];
    verifications = (verRows || []) as VerificationRequest[];

    const jobIds = jobs.map((j) => j.id);
    if (jobIds.length > 0) {
      const { data: appRows } = await supabase
        .from("applications")
        .select("*, student:profiles(*)")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      const studentIds = Array.from(
        new Set((appRows || []).map((a: { student_id: string }) => a.student_id))
      );

      const { data: stuProfiles } =
        studentIds.length > 0
          ? await supabase
              .from("student_profiles")
              .select("*")
              .in("user_id", studentIds)
          : { data: [] };

      const spMap = new Map(
        (stuProfiles || []).map((sp: StudentProfile) => [sp.user_id, sp])
      );
      const jobMap = new Map(jobs.map((j) => [j.id, j]));

      applications = (appRows || []).map((a: Record<string, unknown>) => ({
        ...(a as unknown as Application),
        job: jobMap.get(String(a.job_id)),
        student: Array.isArray(a.student) ? a.student[0] : a.student,
        student_profile: spMap.get(String(a.student_id)),
      })) as Application[];
    }
  } else {
    const db = readSandboxDb();
    employerProfile =
      db.employer_profiles.find((e) => e.user_id === userId) ?? null;
    if (!employerProfile) return null;

    jobs = db.jobs
      .filter((j) => j.employer_id === employerProfile!.id)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const profMap = new Map(db.profiles.map((p) => [p.id, p]));
    const spMap = new Map(db.student_profiles.map((sp) => [sp.user_id, sp]));

    applications = db.applications
      .filter((a) => jobMap.has(a.job_id))
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((a) => ({
        ...a,
        job: jobMap.get(a.job_id),
        student: profMap.get(a.student_id),
        student_profile: spMap.get(a.student_id),
      }));

    verifications = db.verification_requests
      .filter((v) => v.employer_id === employerProfile!.id)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  // Đếm số lượng ứng viên trên từng tin
  const countByJob = new Map<string, number>();
  applications.forEach((a) => {
    countByJob.set(a.job_id, (countByJob.get(a.job_id) || 0) + 1);
  });
  const jobsWithCounts = jobs.map((j) => ({
    ...j,
    employer: employerProfile!,
    applications_count: countByJob.get(j.id) || 0,
  }));

  // Tạo dữ liệu biểu đồ ứng tuyển theo tuần/tháng (cho Recharts)
  const chartBuckets = new Map<string, number>();
  applications.forEach((app) => {
    const d = new Date(app.created_at);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;
    chartBuckets.set(label, (chartBuckets.get(label) || 0) + 1);
  });

  const chartData =
    chartBuckets.size > 0
      ? Array.from(chartBuckets.entries())
          .map(([date, count]) => ({ date, applications: count }))
          .reverse()
      : [
          { date: "Tuần 1", applications: 0 },
          { date: "Tuần 2", applications: 0 },
        ];

  return {
    employerProfile,
    jobs: jobsWithCounts,
    applications,
    verifications,
    chartData,
    stats: {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === "active").length,
      closedJobs: jobs.filter((j) => j.status === "closed").length,
      totalApplicants: applications.length,
      pendingApplicants: applications.filter((a) => a.status === "pending").length,
    },
  };
}

/**
 * Dữ liệu tổng hợp cho cổng Quản trị viên (Admin)
 */
export async function getAdminPortalData() {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "admin") {
    return null;
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const [
      { data: users },
      { data: employers },
      { data: verifications },
      { data: jobs },
      { data: reports },
      { data: logs },
      { count: appCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("employer_profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("verification_requests")
        .select("*, employer:employer_profiles(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("*, employer:employer_profiles(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("job_reports")
        .select("*, job:jobs(*, employer:employer_profiles(*)), reporter:profiles(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("admin_logs")
        .select("*, admin:profiles(id, full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("applications").select("*", { count: "exact", head: true }),
    ]);

    const userList = (users || []) as Profile[];
    const empList = (employers || []) as EmployerProfile[];
    const jobList = (jobs || []).map((j: Record<string, unknown>) => ({
      ...(j as unknown as Job),
      employer: Array.isArray(j.employer) ? j.employer[0] : j.employer,
    })) as Job[];
    const verList = (verifications || []).map((v: Record<string, unknown>) => ({
      ...(v as unknown as VerificationRequest),
      employer: Array.isArray(v.employer) ? v.employer[0] : v.employer,
    })) as VerificationRequest[];
    const repList = (reports || []).map((r: Record<string, unknown>) => ({
      ...(r as unknown as JobReport),
      job: Array.isArray(r.job) ? r.job[0] : r.job,
      reporter: Array.isArray(r.reporter) ? r.reporter[0] : r.reporter,
    })) as JobReport[];

    return {
      users: userList,
      employers: empList,
      verifications: verList,
      jobs: jobList,
      reports: repList,
      logs: (logs || []) as AdminLog[],
      stats: {
        totalUsers: userList.length,
        totalStudents: userList.filter((u) => u.role === "student").length,
        totalEmployers: empList.length,
        totalJobs: jobList.length,
        activeJobs: jobList.filter((j) => j.status === "active").length,
        reportedJobs: repList.filter((r) => r.status === "pending").length,
        pendingVerifications: verList.filter((v) => v.status === "pending").length,
        totalApplications: appCount ?? 0,
      },
    };
  }

  const db = readSandboxDb();
  const empMap = new Map(db.employer_profiles.map((e) => [e.id, e]));
  const profMap = new Map(db.profiles.map((p) => [p.id, p]));
  const jobs = db.jobs
    .map((j) => ({ ...j, employer: empMap.get(j.employer_id) }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const verifications = db.verification_requests
    .map((v) => ({ ...v, employer: empMap.get(v.employer_id) }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const reports = db.job_reports
    .map((r) => ({
      ...r,
      job: jobMap.get(r.job_id),
      reporter: profMap.get(r.reporter_id),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const logs = db.admin_logs
    .map((l) => {
      const adm = profMap.get(l.admin_id);
      return {
        ...l,
        admin: adm ? { id: adm.id, full_name: adm.full_name, email: adm.email } : undefined,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    users: [...db.profiles].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    employers: [...db.employer_profiles],
    verifications,
    jobs,
    reports,
    logs,
    stats: {
      totalUsers: db.profiles.length,
      totalStudents: db.profiles.filter((u) => u.role === "student").length,
      totalEmployers: db.employer_profiles.length,
      totalJobs: db.jobs.length,
      activeJobs: db.jobs.filter((j) => j.status === "active").length,
      reportedJobs: db.job_reports.filter((r) => r.status === "pending").length,
      pendingVerifications: db.verification_requests.filter(
        (v) => v.status === "pending"
      ).length,
      totalApplications: db.applications.length,
    },
  };
}

export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    return (data || []) as AppNotification[];
  }

  const db = readSandboxDb();
  return db.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

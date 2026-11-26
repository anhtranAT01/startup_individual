import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  Flame,
  SearchX,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { JobFilterParams } from "@/types/database";
import { getCurrentAuthContext, queryJobs } from "@/services/data-service";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilterPanel } from "@/components/jobs/jobs-filter-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Danh sách việc làm thêm cho sinh viên",
};

interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobsDirectoryPage({ searchParams }: JobsPageProps) {
  const sp = await searchParams;
  const auth = await getCurrentAuthContext();

  const filters: JobFilterParams = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    job_type: typeof sp.job_type === "string" ? sp.job_type : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    salary_range:
      typeof sp.salary_range === "string" ? sp.salary_range : undefined,
    location: typeof sp.location === "string" ? sp.location : undefined,
    working_time:
      typeof sp.working_time === "string" ? sp.working_time : undefined,
    verified_only: sp.verified_only === "1",
    sort:
      sp.sort === "salary_desc" || sp.sort === "best_match"
        ? sp.sort
        : "newest",
    page: typeof sp.page === "string" ? Number(sp.page) || 1 : 1,
    limit: 9,
  };

  const result = await queryJobs(filters, auth.studentProfile);

  function buildPageHref(targetPage: number) {
    const qs = new URLSearchParams();
    if (filters.q) qs.set("q", filters.q);
    if (filters.job_type) qs.set("job_type", filters.job_type);
    if (filters.category) qs.set("category", filters.category);
    if (filters.salary_range) qs.set("salary_range", filters.salary_range);
    if (filters.location) qs.set("location", filters.location);
    if (filters.working_time) qs.set("working_time", filters.working_time);
    if (filters.verified_only) qs.set("verified_only", "1");
    if (filters.sort && filters.sort !== "newest") qs.set("sort", filters.sort);
    qs.set("page", String(targetPage));
    return `/jobs?${qs.toString()}`;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Green Campaign Banner Header on /jobs page */}
      <div className="bg-hero-mesh text-white py-8 border-b border-emerald-900">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-[#4ade80]">
                <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                Cổng Việc làm Sinh viên Chuẩn hóa & Đã Xác minh
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Tìm kiếm Việc làm Thêm, Thực tập & Freelance
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 max-w-2xl">
                Kết hợp linh hoạt bộ lọc theo lịch học, khu vực, mức lương và
                huy hiệu xác minh nhà tuyển dụng để tìm công việc an toàn nhất.
              </p>
            </div>

            {/* Promotional Mini Ad Card on Jobs Header */}
            <div className="rounded-2xl border border-emerald-400/30 bg-white/10 backdrop-blur-md p-4 max-w-sm shrink-0">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f] text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#4ade80] uppercase">
                    Bảo vệ quyền lợi sinh viên
                  </p>
                  <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                    Ưu tiên bật bộ lọc <strong>&ldquo;Chỉ nhà tuyển dụng đã xác minh&rdquo;</strong> để an tâm ứng tuyển 100%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Filter Column on Desktop */}
          <div className="lg:col-span-4 xl:col-span-3">
            <JobsFilterPanel
              initialFilters={filters}
              totalResults={result.total}
            />
          </div>

          {/* Right Job Listing */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Quick Spotlight Promo Strip inside Jobs Results */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00b14f] text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Tìm thấy <span className="text-[#009b45]">{result.total}</span> cơ hội việc làm đang mở tuyển
                  </p>
                  <p className="text-xs text-slate-500">
                    Mọi tin đăng đều công khai mức lương và khung giờ ca làm rõ ràng
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#00873c]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Trang {result.page} / {result.totalPages}
                </span>
              </div>
            </div>

            {result.connectionError ? (
              <Card className="p-8 border-rose-200 bg-rose-50/50 text-center space-y-3">
                <AlertCircle className="h-9 w-9 text-rose-600 mx-auto" />
                <h3 className="text-base font-bold text-rose-900">
                  Không thể kết nối cơ sở dữ liệu
                </h3>
                <p className="text-sm text-rose-700">{result.connectionError}</p>
              </Card>
            ) : result.jobs.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#00b14f]">
                  <SearchX className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chưa tìm thấy công việc khớp với bộ lọc hiện tại
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Hãy thử nới rộng khu vực tìm kiếm, đổi khung giờ ca làm hoặc xóa
                  bớt tiêu chí lọc để xem thêm các cơ hội khác.
                </p>
                <Link href="/jobs" className="inline-block pt-1">
                  <Button variant="primary">Xem lại toàn bộ việc làm</Button>
                </Link>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      showMatchScore={filters.sort === "best_match"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {result.totalPages > 1 ? (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Link key={p} href={buildPageHref(p)}>
                          <Button
                            variant={p === result.page ? "primary" : "outline"}
                            size="sm"
                            className="min-w-9"
                          >
                            {p}
                          </Button>
                        </Link>
                      )
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

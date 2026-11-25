import Link from "next/link";
import { AlertCircle, SearchX } from "lucide-react";
import type { JobFilterParams } from "@/types/database";
import { getCurrentAuthContext, queryJobs } from "@/services/data-service";
import { JobCard } from "@/components/jobs/job-card";
import { JobsFilterPanel } from "@/components/jobs/jobs-filter-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <div className="container py-10">
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Tìm kiếm Việc làm Sinh viên
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kết hợp linh hoạt bộ lọc theo lịch học, khu vực, mức lương và trạng
          thái xác minh nhà tuyển dụng.
        </p>
      </div>

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
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <p>
              Tìm thấy{" "}
              <strong className="text-slate-900">{result.total}</strong> công
              việc đang tuyển dụng
            </p>
            <p className="text-xs text-slate-400">
              Trang {result.page} / {result.totalPages}
            </p>
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { APPLICATION_STATUS_MAP } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import {
  getCurrentAuthContext,
  getStudentPortalData,
} from "@/services/data-service";
import { JobCard } from "@/components/jobs/job-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Bảng điều khiển Sinh viên" };

export default async function StudentDashboardPage() {
  const auth = await getCurrentAuthContext();
  const data = await getStudentPortalData(auth.user!.id);

  const applications = data?.applications || [];
  const savedJobs = data?.savedJobs || [];
  const recommendedJobs = data?.recommendedJobs || [];

  const pendingCount = applications.filter((a) =>
    ["pending", "reviewed", "shortlisted"].includes(a.status)
  ).length;
  const acceptedCount = applications.filter(
    (a) => a.status === "accepted"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Dashboard Sinh viên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi nhanh đơn ứng tuyển, việc làm yêu thích và các cơ hội khớp
            lịch học của bạn.
          </p>
        </div>
        <Link href="/student/profile">
          <Button variant="primary">Cập nhật Hồ sơ & CV</Button>
        </Link>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Việc làm đã lưu
            </span>
            <Bookmark className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {savedJobs.length}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Tổng đơn ứng tuyển
            </span>
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {applications.length}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Đơn đang chờ xử lý
            </span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">
            {pendingCount}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Đơn được chấp nhận
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">
            {acceptedCount}
          </p>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Đơn ứng tuyển gần đây
          </h2>
          <Link
            href="/student/applications"
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Bạn chưa gửi đơn ứng tuyển nào.{" "}
            <Link href="/jobs" className="font-semibold text-blue-700 underline">
              Khám phá công việc ngay
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 4).map((app) => {
              const st = APPLICATION_STATUS_MAP[app.status];
              return (
                <div
                  key={app.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <Link
                      href={`/jobs/${app.job_id}`}
                      className="font-semibold text-slate-900 hover:text-blue-700"
                    >
                      {app.job?.title || "Công việc"}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {app.job?.employer?.company_name} • Nộp ngày{" "}
                      {formatDateVN(app.created_at)}
                    </p>
                  </div>
                  <Badge className={st?.badgeClass}>{st?.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recommended Jobs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-600" />
            Công việc mới phù hợp với hồ sơ của bạn
          </h2>
          <Link href="/jobs?sort=best_match">
            <Button variant="outline" size="sm">
              Xem thêm <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedJobs.map((job) => (
            <JobCard key={job.id} job={job} showMatchScore />
          ))}
        </div>
      </section>
    </div>
  );
}

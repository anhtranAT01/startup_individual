import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Lock,
  PlusCircle,
  Users,
} from "lucide-react";
import { APPLICATION_STATUS_MAP } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import {
  getCurrentAuthContext,
  getEmployerPortalData,
} from "@/services/data-service";
import { EmployerApplicationsChart } from "@/components/dashboard/employer-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Dashboard Nhà tuyển dụng" };

export default async function EmployerDashboardPage() {
  const auth = await getCurrentAuthContext();
  const data = await getEmployerPortalData(auth.user!.id);

  const stats = data?.stats || {
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    totalApplicants: 0,
    pendingApplicants: 0,
  };
  const verStatus = data?.employerProfile.verification_status;

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Tổng quan Tuyển dụng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý hiệu quả tin đăng và tiến độ tiếp nhận ứng viên sinh viên.
          </p>
        </div>
        <Link href="/employer/jobs/create">
          <Button variant="primary">
            <PlusCircle className="h-4 w-4" />
            Tạo tin tuyển dụng mới
          </Button>
        </Link>
      </div>

      {verStatus !== "verified" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-sm">
                Tài khoản của bạn chưa hoàn tất xác minh
              </p>
              <p>
                Bạn vẫn có thể soạn và lưu bản nháp tin tuyển dụng, nhưng cần được
                xác minh đơn vị trước khi xuất bản tin công khai tới sinh viên.
              </p>
            </div>
          </div>
          <Link href="/employer/verification" className="shrink-0">
            <Button variant="secondary" size="sm">
              Gửi hồ sơ xác minh →
            </Button>
          </Link>
        </div>
      ) : null}

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tổng tin đăng <Briefcase className="h-4 w-4 text-blue-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats.totalJobs}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Đang hoạt động <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">
            {stats.activeJobs}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tổng ứng viên <Users className="h-4 w-4 text-cyan-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats.totalApplicants}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Hồ sơ chờ xem <Clock className="h-4 w-4 text-amber-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-amber-700">
            {stats.pendingApplicants}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tin đã đóng <Lock className="h-4 w-4 text-slate-400" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-700">
            {stats.closedJobs}
          </p>
        </Card>
      </div>

      {/* Recharts Analytics */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Biểu đồ lượng hồ sơ ứng tuyển theo thời gian
          </h2>
          <p className="text-xs text-slate-500">
            Thống kê trực tiếp từ các đơn ứng tuyển vào tin đăng của đơn vị bạn
          </p>
        </div>
        <EmployerApplicationsChart data={data?.chartData || []} />
      </Card>

      {/* Latest Applicants */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Ứng viên mới nhất
          </h2>
          <Link
            href="/employer/applications"
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Quản lý toàn bộ ứng viên →
          </Link>
        </div>

        {!data || data.applications.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Chưa có hồ sơ ứng tuyển nào. Hãy xuất bản tin tuyển dụng để tiếp cận sinh viên.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.applications.slice(0, 5).map((app) => {
              const st = APPLICATION_STATUS_MAP[app.status];
              return (
                <div
                  key={app.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {app.student?.full_name || "Sinh viên"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Vị trí: {app.job?.title} • {formatDateVN(app.created_at)}
                    </p>
                  </div>
                  <Badge className={st?.badgeClass}>{st?.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

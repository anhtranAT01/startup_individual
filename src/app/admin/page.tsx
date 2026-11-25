import Link from "next/link";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Flag,
  GraduationCap,
  ShieldAlert,
  Users,
} from "lucide-react";
import { getAdminPortalData } from "@/services/data-service";
import { AdminOverviewChartAndLogs } from "@/components/dashboard/admin-panels-client";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Bảng điều khiển Quản trị viên" };

export default async function AdminDashboardPage() {
  const data = await getAdminPortalData();
  const s = data?.stats || {
    totalUsers: 0,
    totalStudents: 0,
    totalEmployers: 0,
    totalJobs: 0,
    activeJobs: 0,
    reportedJobs: 0,
    pendingVerifications: 0,
    totalApplications: 0,
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Tổng quan Quản trị Hệ thống
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Số liệu thời gian thực từ cơ sở dữ liệu STUWORK và nhật ký kiểm duyệt an toàn.
        </p>
      </div>

      {/* 7 Required Admin Metrics (Part XI.3 PRD) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tổng người dùng <Users className="h-4 w-4 text-blue-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.totalUsers}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tổng sinh viên <GraduationCap className="h-4 w-4 text-cyan-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.totalStudents}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tổng nhà tuyển dụng <Building2 className="h-4 w-4 text-indigo-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.totalEmployers}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Tổng công việc <Briefcase className="h-4 w-4 text-slate-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {s.totalJobs}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 flex items-center justify-between">
            Việc đang tuyển <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">
            {s.activeJobs}
          </p>
        </Card>

        <Link href="/admin/reports">
          <Card className="p-4 border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors">
            <span className="text-xs text-rose-800 font-medium flex items-center justify-between">
              Báo cáo chờ xử lý <Flag className="h-4 w-4 text-rose-600" />
            </span>
            <p className="mt-2 text-2xl font-extrabold text-rose-700">
              {s.reportedJobs}
            </p>
          </Card>
        </Link>

        <Link href="/admin/verifications" className="col-span-2">
          <Card className="p-4 border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
            <span className="text-xs text-amber-900 font-medium flex items-center justify-between">
              Yêu cầu xác minh nhà tuyển dụng chờ duyệt
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </span>
            <p className="mt-2 text-2xl font-extrabold text-amber-800">
              {s.pendingVerifications} hồ sơ cần thẩm định →
            </p>
          </Card>
        </Link>
      </div>

      <AdminOverviewChartAndLogs
        stats={{
          totalStudents: s.totalStudents,
          totalEmployers: s.totalEmployers,
          activeJobs: s.activeJobs,
          totalApplications: s.totalApplications,
        }}
        logs={data?.logs || []}
      />
    </div>
  );
}

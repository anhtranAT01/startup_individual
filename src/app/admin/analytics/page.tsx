import { getAdminPortalData } from "@/services/data-service";
import { AdminOverviewChartAndLogs } from "@/components/dashboard/admin-panels-client";

export const metadata = { title: "Thống kê & Nhật ký – Admin" };

export default async function AdminAnalyticsPage() {
  const data = await getAdminPortalData();
  const s = data?.stats || {
    totalStudents: 0,
    totalEmployers: 0,
    activeJobs: 0,
    totalApplications: 0,
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Thống kê Hoạt động & Lịch sử Quản trị
      </h1>
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

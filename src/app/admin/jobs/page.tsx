import { getAdminPortalData } from "@/services/data-service";
import { AdminJobsPanel } from "@/components/dashboard/admin-panels-client";

export const metadata = { title: "Kiểm duyệt Tin tuyển dụng – Admin" };

export default async function AdminJobsPage() {
  const data = await getAdminPortalData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Quản lý Toàn bộ Tin Tuyển dụng
      </h1>
      <AdminJobsPanel jobs={data?.jobs || []} />
    </div>
  );
}

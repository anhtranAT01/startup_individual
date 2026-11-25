import { getAdminPortalData } from "@/services/data-service";
import { AdminReportsPanel } from "@/components/dashboard/admin-panels-client";

export const metadata = { title: "Xử lý Báo cáo vi phạm – Admin" };

export default async function AdminReportsPage() {
  const data = await getAdminPortalData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Danh sách Báo cáo Tin Tuyển dụng Đáng ngờ
      </h1>
      <AdminReportsPanel reports={data?.reports || []} />
    </div>
  );
}

import { getAdminPortalData } from "@/services/data-service";
import { AdminVerificationsPanel } from "@/components/dashboard/admin-panels-client";

export const metadata = { title: "Duyệt yêu cầu xác minh – Admin" };

export default async function AdminVerificationsPage() {
  const data = await getAdminPortalData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Xử lý Yêu cầu Xác minh Nhà tuyển dụng
      </h1>
      <AdminVerificationsPanel verifications={data?.verifications || []} />
    </div>
  );
}

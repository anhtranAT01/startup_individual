import { getAdminPortalData } from "@/services/data-service";
import { AdminEmployersList } from "@/components/dashboard/admin-panels-client";

export const metadata = { title: "Quản lý Nhà tuyển dụng – Admin" };

export default async function AdminEmployersPage() {
  const data = await getAdminPortalData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Danh sách Đơn vị Nhà tuyển dụng
      </h1>
      <AdminEmployersList employers={data?.employers || []} />
    </div>
  );
}

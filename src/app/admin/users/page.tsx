import { getAdminPortalData } from "@/services/data-service";
import { AdminUsersTable } from "@/components/dashboard/admin-panels-client";

export const metadata = { title: "Quản lý Người dùng – Admin" };

export default async function AdminUsersPage() {
  const data = await getAdminPortalData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Quản lý Tài khoản Sinh viên & Người dùng
      </h1>
      <AdminUsersTable users={data?.users || []} />
    </div>
  );
}

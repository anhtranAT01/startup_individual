import {
  getCurrentAuthContext,
  getStudentPortalData,
} from "@/services/data-service";
import { StudentApplicationsClient } from "@/components/dashboard/student-applications-client";

export const metadata = { title: "Quản lý đơn ứng tuyển" };

export default async function StudentApplicationsPage() {
  const auth = await getCurrentAuthContext();
  const data = await getStudentPortalData(auth.user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Theo dõi Trạng thái Ứng tuyển
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật trực tiếp tiến trình xét duyệt hồ sơ từ các nhà tuyển dụng.
        </p>
      </div>

      <StudentApplicationsClient applications={data?.applications || []} />
    </div>
  );
}

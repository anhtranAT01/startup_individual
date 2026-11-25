import { redirect } from "next/navigation";
import {
  getCurrentAuthContext,
  getStudentPortalData,
} from "@/services/data-service";
import { StudentApplicationsClient } from "@/components/dashboard/student-applications-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Application Pipeline – Quản lý ứng tuyển" };

export default async function StudentApplicationsPage() {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/student/applications");
  }
  const data = await getStudentPortalData(auth.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Application Pipeline
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi tiến trình ứng tuyển theo thời gian thực, cập nhật phản hồi
          trực tiếp từ các đơn vị tuyển dụng.
        </p>
      </div>

      <StudentApplicationsClient applications={data?.applications || []} />
    </div>
  );
}

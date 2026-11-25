import {
  getCurrentAuthContext,
  getStudentPortalData,
} from "@/services/data-service";
import { SavedJobsListClient } from "@/components/dashboard/saved-jobs-client";

export const metadata = { title: "Công việc đã lưu" };

export default async function StudentSavedJobsPage() {
  const auth = await getCurrentAuthContext();
  const data = await getStudentPortalData(auth.user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Công việc Đã lưu
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Các tin tuyển dụng bạn quan tâm được đồng bộ trực tiếp trên tài khoản STUWORK.
        </p>
      </div>

      <SavedJobsListClient savedJobs={data?.savedJobs || []} />
    </div>
  );
}

import { notFound } from "next/navigation";
import {
  getCurrentAuthContext,
  getEmployerPortalData,
} from "@/services/data-service";
import { JobEditorForm } from "@/components/forms/job-editor-form";

export const metadata = { title: "Chỉnh sửa tin tuyển dụng" };

export default async function EditEmployerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getCurrentAuthContext();
  const data = await getEmployerPortalData(auth.user!.id);

  const targetJob = data?.jobs.find((j) => j.id === id);
  if (!targetJob) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Chỉnh sửa Tin Tuyển dụng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật thông tin công việc của đơn vị bạn.
        </p>
      </div>

      <JobEditorForm
        initialJob={targetJob}
        isVerifiedEmployer={
          auth.employerProfile?.verification_status === "verified"
        }
        companyEmail={auth.user!.email}
      />
    </div>
  );
}

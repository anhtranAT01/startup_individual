import { redirect } from "next/navigation";
import { getCurrentAuthContext } from "@/services/data-service";
import { JobEditorForm } from "@/components/forms/job-editor-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tạo tin tuyển dụng mới" };

export default async function CreateJobPage() {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/employer/jobs/create");
  }
  const isVerified = auth.employerProfile?.verification_status === "verified";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Tạo Tin Tuyển dụng Mới
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chuẩn hóa đầy đủ mức lương, thời gian ca làm và quyền lợi để thu hút ứng viên phù hợp nhất.
        </p>
      </div>

      <JobEditorForm
        isVerifiedEmployer={isVerified}
        companyEmail={auth.user?.email || ""}
      />
    </div>
  );
}

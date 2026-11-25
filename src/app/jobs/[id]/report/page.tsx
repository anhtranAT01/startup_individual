import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getCurrentAuthContext,
  getJobDetailById,
} from "@/services/data-service";
import { ReportJobForm } from "@/components/forms/report-job-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Báo cáo tin tuyển dụng đáng ngờ" };

export default async function ReportJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect(`/login?next=/jobs/${id}/report`);
  }

  const detail = await getJobDetailById(id, auth.user);
  if (!detail) notFound();

  return (
    <div className="container py-10 max-w-2xl space-y-6">
      <Link
        href={`/jobs/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang công việc
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Báo cáo Tin tuyển dụng Đáng ngờ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chung tay bảo vệ cộng đồng sinh viên khỏi các tin tuyển dụng thiếu minh bạch.
        </p>
      </div>

      <ReportJobForm
        jobId={detail.job.id}
        jobTitle={detail.job.title}
        companyName={detail.job.employer?.company_name || "Đơn vị tuyển dụng"}
      />
    </div>
  );
}

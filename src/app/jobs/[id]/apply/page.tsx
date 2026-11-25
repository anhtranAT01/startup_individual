import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertOctagon } from "lucide-react";
import { formatSalaryRange, isJobExpired } from "@/lib/utils";
import {
  getCurrentAuthContext,
  getJobDetailById,
} from "@/services/data-service";
import { ApplyJobForm } from "@/components/forms/apply-job-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Ứng tuyển công việc" };

export default async function ApplyJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getCurrentAuthContext();

  if (!auth.user) {
    redirect(`/login?next=/jobs/${id}/apply`);
  }

  if (auth.user.role !== "student") {
    redirect(`/jobs/${id}`);
  }

  const detail = await getJobDetailById(id, auth.user);
  if (!detail) notFound();

  const { job, existingApplication } = detail;
  const closedOrExpired = job.status !== "active" || isJobExpired(job.deadline);

  return (
    <div className="container py-10 max-w-3xl space-y-6">
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại chi tiết công việc
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Ứng tuyển: {job.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {job.employer?.company_name} •{" "}
          <span className="font-semibold text-blue-700">
            {formatSalaryRange(job.salary_min, job.salary_max, job.salary_unit)}
          </span>{" "}
          • {job.location}
        </p>
      </div>

      {existingApplication && existingApplication.status !== "withdrawn" ? (
        <Card className="p-8 text-center space-y-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">
            Bạn đã ứng tuyển công việc này rồi
          </h2>
          <p className="text-sm text-slate-600">
            Mỗi sinh viên chỉ có một đơn ứng tuyển đang hoạt động cho mỗi vị trí
            nhằm đảm bảo quy trình xét duyệt minh bạch.
          </p>
          <Link href="/student/applications">
            <Button variant="primary">Xem trạng thái đơn ứng tuyển</Button>
          </Link>
        </Card>
      ) : closedOrExpired ? (
        <Card className="p-8 text-center space-y-4 border-rose-200 bg-rose-50/40">
          <AlertOctagon className="h-10 w-10 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">
            Công việc này đã ngừng nhận hồ sơ hoặc hết hạn ứng tuyển
          </h2>
          <Link href="/jobs">
            <Button variant="primary">Khám phá các việc làm khác</Button>
          </Link>
        </Card>
      ) : (
        <ApplyJobForm
          job={job}
          user={auth.user}
          studentProfile={auth.studentProfile}
        />
      )}
    </div>
  );
}

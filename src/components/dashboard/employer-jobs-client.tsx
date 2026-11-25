"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  ExternalLink,
  Eye,
  Lock,
  PlusCircle,
  Unlock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/types/database";
import { formatDateVN, formatSalaryRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toggleEmployerJobStatusAction } from "@/services/actions";

const JOB_STATUS_LABELS: Record<
  Job["status"],
  { label: string; tone: "verified" | "warning" | "neutral" | "danger" }
> = {
  active: { label: "Đang tuyển", tone: "verified" },
  draft: { label: "Bản nháp", tone: "neutral" },
  pending: { label: "Chờ duyệt", tone: "warning" },
  closed: { label: "Đã đóng", tone: "neutral" },
  rejected: { label: "Bị ẩn / Từ chối", tone: "danger" },
};

export function EmployerJobsClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleToggle(job: Job) {
    const nextStatus = job.status === "active" ? "closed" : "active";
    setBusyId(job.id);
    const res = await toggleEmployerJobStatusAction(job.id, nextStatus);
    setBusyId(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Đơn vị của bạn chưa đăng tin tuyển dụng nào
        </h3>
        <p className="text-sm text-slate-500">
          Tạo tin tuyển dụng đầu tiên để bắt đầu tiếp nhận hồ sơ sinh viên.
        </p>
        <Link href="/employer/jobs/create" className="inline-block pt-1">
          <Button variant="primary">
            <PlusCircle className="h-4 w-4" />
            Tạo tin mới
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const st = JOB_STATUS_LABELS[job.status];
        return (
          <Card key={job.id} className="p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <Badge tone="default">{job.job_type}</Badge>
                  {job.is_demo ? <Badge tone="demo">Demo</Badge> : null}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {job.location} •{" "}
                  <span className="font-semibold text-blue-700">
                    {formatSalaryRange(
                      job.salary_min,
                      job.salary_max,
                      job.salary_unit
                    )}
                  </span>{" "}
                  • Hạn nộp: {formatDateVN(job.deadline)}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
                <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 font-medium">
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  {job.views_count || 0} lượt xem
                </span>
                <Link
                  href={`/employer/applications?job=${job.id}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Users className="h-3.5 w-3.5" />
                  {job.applications_count || 0} ứng viên
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Link href={`/jobs/${job.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Xem trang tin
                </Button>
              </Link>
              <Link href={`/employer/jobs/${job.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-3.5 w-3.5" />
                  Chỉnh sửa
                </Button>
              </Link>
              {job.status !== "rejected" ? (
                <Button
                  variant={job.status === "active" ? "outline" : "secondary"}
                  size="sm"
                  disabled={busyId === job.id}
                  onClick={() => handleToggle(job)}
                >
                  {job.status === "active" ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      Đóng tin
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5" />
                      Mở lại tin
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkX, ExternalLink, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SavedJob } from "@/types/database";
import { formatSalaryRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toggleSaveJobAction } from "@/services/actions";

export function SavedJobsListClient({ savedJobs }: { savedJobs: SavedJob[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleRemove(jobId: string) {
    setBusyId(jobId);
    const res = await toggleSaveJobAction(jobId);
    setBusyId(null);
    if (res.ok) {
      toast.success("Đã xóa khỏi danh sách việc đã lưu.");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  if (savedJobs.length === 0) {
    return (
      <Card className="p-12 text-center space-y-3">
        <BookmarkX className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">
          Danh sách việc làm đã lưu đang trống
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Nhấn nút &ldquo;Lưu công việc&rdquo; trên trang chi tiết tin tuyển dụng để
          đồng bộ và xem lại bất cứ lúc nào trên mọi thiết bị.
        </p>
        <Link href="/jobs" className="inline-block pt-1">
          <Button variant="primary">Khám phá việc làm</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {savedJobs.map((item) => {
        const job = item.job;
        if (!job) return null;
        return (
          <Card key={item.id} className="p-5 flex flex-col justify-between gap-4">
            <div>
              <Link
                href={`/jobs/${job.id}`}
                className="text-base font-bold text-slate-900 hover:text-blue-700"
              >
                {job.title}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">
                {job.employer?.company_name} • {job.location}
              </p>
              <p className="mt-2 text-sm font-bold text-blue-700">
                {formatSalaryRange(
                  job.salary_min,
                  job.salary_max,
                  job.salary_unit
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Thời gian: {job.working_time}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                disabled={busyId === job.id}
                onClick={() => handleRemove(job.id)}
                className="text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Bỏ lưu
              </Button>

              <div className="flex items-center gap-2">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Xem chi tiết
                  </Button>
                </Link>
                <Link href={`/jobs/${job.id}/apply`}>
                  <Button variant="primary" size="sm">
                    <Send className="h-3.5 w-3.5" />
                    Ứng tuyển ngay
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

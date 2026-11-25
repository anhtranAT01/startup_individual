"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ExternalLink, FileX2, MessageSquare, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { APPLICATION_STATUS_MAP } from "@/lib/constants";
import { formatDateVN, formatSalaryRange } from "@/lib/utils";
import type { Application } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { SelectNative } from "@/components/ui/form-controls";
import { withdrawApplicationAction } from "@/services/actions";

export function StudentApplicationsClient({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [timeFilter, setTimeFilter] = React.useState("all");
  const [withdrawTarget, setWithdrawTarget] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);

  const filtered = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (timeFilter === "7days") {
      const diff = Date.now() - new Date(app.created_at).getTime();
      if (diff > 7 * 24 * 3600 * 1000) return false;
    } else if (timeFilter === "30days") {
      const diff = Date.now() - new Date(app.created_at).getTime();
      if (diff > 30 * 24 * 3600 * 1000) return false;
    }
    return true;
  });

  async function handleConfirmWithdraw() {
    if (!withdrawTarget) return;
    setLoading(true);
    const res = await withdrawApplicationAction(withdrawTarget);
    setLoading(false);
    setWithdrawTarget(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SelectNative
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-52"
          >
            <option value="all">Tất cả trạng thái ({applications.length})</option>
            {Object.entries(APPLICATION_STATUS_MAP).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </SelectNative>

          <SelectNative
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">Mọi thời gian</option>
            <option value="7days">7 ngày gần đây</option>
            <option value="30days">30 ngày gần đây</option>
          </SelectNative>
        </div>

        <span className="text-xs text-slate-500">
          Hiển thị <strong>{filtered.length}</strong> đơn ứng tuyển
        </span>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <FileX2 className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            Không có đơn ứng tuyển nào trong mục này
          </h3>
          <p className="text-sm text-slate-500">
            Hãy khám phá các cơ hội việc làm thêm phù hợp và gửi hồ sơ đầu tiên của bạn.
          </p>
          <Link href="/jobs" className="inline-block pt-1">
            <Button variant="primary">Tìm việc ngay</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const st = APPLICATION_STATUS_MAP[app.status];
            const canWithdraw = ["pending", "reviewed"].includes(app.status);
            return (
              <Card key={app.id} className="p-5 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/jobs/${app.job_id}`}
                      className="text-lg font-bold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1.5"
                    >
                      {app.job?.title || "Công việc"}
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {app.job?.employer?.company_name} •{" "}
                      <span className="font-semibold text-blue-700">
                        {formatSalaryRange(
                          app.job?.salary_min,
                          app.job?.salary_max,
                          app.job?.salary_unit
                        )}
                      </span>
                    </p>
                  </div>
                  <Badge className={st?.badgeClass}>{st?.label}</Badge>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <strong className="text-slate-700">Lời giới thiệu đã gửi:</strong>{" "}
                  {app.cover_letter}
                </p>

                {app.employer_note ? (
                  <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-900 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Phản hồi từ nhà tuyển dụng:</strong>{" "}
                      {app.employer_note}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ngày ứng tuyển: {formatDateVN(app.created_at)}
                  </span>

                  <div className="flex items-center gap-2">
                    {app.status === "accepted" ? (
                      <Link href={`/jobs/${app.job_id}`}>
                        <Button variant="secondary" size="sm">
                          Đánh giá công việc
                        </Button>
                      </Link>
                    ) : null}
                    {canWithdraw ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawTarget(app.id)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Hủy đơn ứng tuyển
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleConfirmWithdraw}
        loading={loading}
        danger
        title="Xác nhận rút hồ sơ ứng tuyển"
        description="Sau khi rút hồ sơ, đơn ứng tuyển sẽ chuyển sang trạng thái 'Đã rút hồ sơ' và nhà tuyển dụng sẽ ngừng xét duyệt đơn này. Bạn chắc chắn muốn tiếp tục?"
        confirmLabel="Đồng ý rút đơn"
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  FileX2,
  Kanban,
  LayoutList,
  MessageSquare,
  Star,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { APPLICATION_STATUS_MAP } from "@/lib/constants";
import {
  cn,
  formatDateVN,
  formatRelativeTimeVN,
  formatSalaryRange,
} from "@/lib/utils";
import type { Application } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { SelectNative } from "@/components/ui/form-controls";
import { withdrawApplicationAction } from "@/services/actions";

const KANBAN_COLUMNS: Array<{
  key: Application["status"];
  icon: string;
  title: string;
  subtitle: string;
}> = [
  {
    key: "pending",
    icon: "👋",
    title: "Pending",
    subtitle: "Chờ nhà tuyển dụng xem",
  },
  {
    key: "reviewed",
    icon: "❣️",
    title: "Match / Reviewed",
    subtitle: "Đã xem hồ sơ",
  },
  {
    key: "shortlisted",
    icon: "💬",
    title: "Interview / Shortlist",
    subtitle: "Danh sách tiềm năng",
  },
  {
    key: "accepted",
    icon: "🎉",
    title: "In Process / Accepted",
    subtitle: "Được chấp nhận",
  },
];

export function StudentApplicationsClient({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(
    null
  );
  const [withdrawTarget, setWithdrawTarget] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);

  const outOfPipeline = applications.filter((a) =>
    ["rejected", "withdrawn"].includes(a.status)
  );

  const filteredList = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    return true;
  });

  async function handleConfirmWithdraw() {
    if (!withdrawTarget) return;
    setLoading(true);
    const res = await withdrawApplicationAction(withdrawTarget);
    setLoading(false);
    setWithdrawTarget(null);
    setSelectedApp(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  if (applications.length === 0) {
    return (
      <Card className="p-12 text-center space-y-3">
        <FileX2 className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">
          Pipeline ứng tuyển của bạn đang trống
        </h3>
        <p className="text-sm text-slate-500">
          Hãy ứng tuyển công việc đầu tiên để theo dõi tiến trình theo thời gian
          thực tại đây.
        </p>
        <Link href="/jobs" className="inline-block pt-1">
          <Button variant="primary">Khám phá việc làm</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1">
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
              viewMode === "kanban"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Kanban className="h-3.5 w-3.5 text-blue-600" />
            Kanban Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LayoutList className="h-3.5 w-3.5 text-blue-600" />
            Danh sách chi tiết
          </button>
        </div>

        {viewMode === "list" ? (
          <SelectNative
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-56"
          >
            <option value="all">
              Tất cả trạng thái ({applications.length})
            </option>
            {Object.entries(APPLICATION_STATUS_MAP).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </SelectNative>
        ) : (
          <span className="text-xs text-slate-500">
            Nhấn vào thẻ bất kỳ để xem phản hồi của nhà tuyển dụng hoặc rút hồ sơ
          </span>
        )}
      </div>

      {/* KANBAN PIPELINE BOARD (Matching Image 1: My Application Pipeline) */}
      {viewMode === "kanban" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
            {KANBAN_COLUMNS.map((col) => {
              const colApps = applications.filter((a) => a.status === col.key);
              return (
                <div
                  key={col.key}
                  className="rounded-2xl bg-slate-100/80 border border-slate-200/70 p-3.5 flex flex-col min-h-[420px]"
                >
                  {/* Column Header */}
                  <div className="mb-3.5 px-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span>{col.icon}</span>
                        <span>
                          {col.title} ({colApps.length})
                        </span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {col.subtitle}
                    </p>
                  </div>

                  {/* Cards Stack */}
                  <div className="space-y-3 flex-1">
                    {colApps.map((app) => {
                      const job = app.job;
                      const company =
                        job?.employer?.company_name || "Đơn vị tuyển dụng";
                      const initials = company
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase();
                      const canWithdraw = ["pending", "reviewed"].includes(
                        app.status
                      );

                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:rotate-[-0.6deg] hover:shadow-elevated hover:border-blue-300"
                        >
                          {/* Top Row: Circular Logo + Job Type Label (Exact Image 1 style) */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-extrabold text-blue-700 shadow-2xs">
                              {initials}
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">
                              {job?.job_type || "Student Job"}
                            </span>
                          </div>

                          {/* Job Title & Company */}
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                            {job?.title || "Công việc sinh viên"}
                          </h4>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {company}
                          </p>

                          {app.employer_note ? (
                            <p className="mt-2 line-clamp-2 rounded-lg bg-blue-50/70 px-2.5 py-1.5 text-[11px] text-blue-800">
                              💬 {app.employer_note}
                            </p>
                          ) : null}

                          {/* Bottom Row: Category/Industry on left + Calendar Pill on right (Exact Image 1 style) */}
                          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="block text-[10px] text-slate-400">
                                Lĩnh vực / Lương:
                              </span>
                              <span className="block truncate text-[11px] font-bold text-slate-700">
                                {formatSalaryRange(
                                  job?.salary_min,
                                  job?.salary_max,
                                  job?.salary_unit
                                )}
                              </span>
                            </div>

                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-2xs">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              {formatRelativeTimeVN(app.created_at)}
                            </span>
                          </div>

                          {/* Hover Quick Action Bar */}
                          <div
                            className="mt-3 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[11px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/jobs/${app.job_id}`}
                              className="font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              Chi tiết <ExternalLink className="h-3 w-3" />
                            </Link>
                            {canWithdraw ? (
                              <button
                                type="button"
                                onClick={() => setWithdrawTarget(app.id)}
                                className="font-semibold text-rose-600 hover:underline"
                              >
                                Rút đơn
                              </button>
                            ) : app.status === "accepted" ? (
                              <Link
                                href={`/jobs/${app.job_id}`}
                                className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                              >
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                Đánh giá
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    {colApps.length === 0 ? (
                      <div className="h-36 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                        Chưa có hồ sơ ở cột này
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Out of Pipeline Bottom Strip (Exact Image 1 bottom section) */}
          <div className="rounded-2xl bg-slate-100/80 border border-slate-200/70 p-4">
            <h3 className="text-xs font-extrabold text-slate-800 mb-3">
              Out of Pipeline — Đã rút hoặc Chưa phù hợp ({outOfPipeline.length})
            </h3>
            {outOfPipeline.length === 0 ? (
              <p className="text-xs text-slate-500">
                Không có hồ sơ nào bị từ chối hoặc rút đơn.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {outOfPipeline.map((app) => {
                  const st = APPLICATION_STATUS_MAP[app.status];
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/jobs/${app.job_id}`}
                          className="block truncate text-sm font-bold text-slate-800 hover:text-blue-700"
                        >
                          {app.job?.title}
                        </Link>
                        <p className="truncate text-xs text-slate-500">
                          {app.job?.employer?.company_name}
                        </p>
                      </div>
                      <Badge className={st?.badgeClass}>{st?.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DETAILED LIST VIEW */
        <div className="space-y-4">
          {filteredList.map((app) => {
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
                  <strong className="text-slate-700">
                    Lời giới thiệu đã gửi:
                  </strong>{" "}
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
                  <span>Ngày ứng tuyển: {formatDateVN(app.created_at)}</span>
                  <div className="flex items-center gap-2">
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

      {/* Quick Detail Modal when clicking a Kanban Card */}
      {selectedApp ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Badge
                className={
                  APPLICATION_STATUS_MAP[selectedApp.status]?.badgeClass
                }
              >
                {APPLICATION_STATUS_MAP[selectedApp.status]?.label}
              </Badge>
              <span className="text-xs text-slate-400">
                Nộp ngày {formatDateVN(selectedApp.created_at)}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {selectedApp.job?.title}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                {selectedApp.job?.employer?.company_name} •{" "}
                {selectedApp.job?.location}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Lời giới thiệu của bạn:</p>
              <p>{selectedApp.cover_letter}</p>
            </div>

            {selectedApp.employer_note ? (
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Ghi chú từ nhà tuyển dụng:</p>
                <p>{selectedApp.employer_note}</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Đóng
              </Button>
              <div className="flex items-center gap-2">
                {["pending", "reviewed"].includes(selectedApp.status) ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setWithdrawTarget(selectedApp.id)}
                  >
                    Rút hồ sơ
                  </Button>
                ) : null}
                <Link href={`/jobs/${selectedApp.job_id}`}>
                  <Button variant="primary" size="sm">
                    Xem trang công việc
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleConfirmWithdraw}
        loading={loading}
        danger
        title="Xác nhận rút hồ sơ ứng tuyển"
        description="Sau khi rút hồ sơ, đơn ứng tuyển sẽ chuyển xuống mục 'Out of Pipeline' và nhà tuyển dụng sẽ ngừng xét duyệt đơn này. Bạn chắc chắn muốn tiếp tục?"
        confirmLabel="Đồng ý rút đơn"
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Ban,
  Check,
  ExternalLink,
  EyeOff,
  FileText,
  Lock,
  Unlock,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { VERIFICATION_STATUS_MAP } from "@/lib/constants";
import { formatDateVN, formatSalaryRange } from "@/lib/utils";
import type {
  AdminLog,
  EmployerProfile,
  Job,
  JobReport,
  Profile,
  VerificationRequest,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { Input, SelectNative, Textarea } from "@/components/ui/form-controls";
import {
  adminModerateJobAction,
  adminResolveReportAction,
  adminReviewVerificationAction,
  adminToggleUserActiveAction,
  getAuthorizedFileUrlAction,
} from "@/services/actions";

export function AdminUsersTable({ users }: { users: Profile[] }) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [lockTarget, setLockTarget] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(false);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (q.trim()) {
      const text = `${u.full_name} ${u.email}`.toLowerCase();
      if (!text.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  async function confirmToggleLock() {
    if (!lockTarget) return;
    setLoading(true);
    const res = await adminToggleUserActiveAction({
      userId: lockTarget.id,
      isActive: !lockTarget.is_active,
      note: `${lockTarget.is_active ? "Khóa" : "Mở khóa"} tài khoản ${
        lockTarget.email
      }`,
    });
    setLoading(false);
    setLockTarget(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm theo họ tên hoặc email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <SelectNative
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">Mọi vai trò ({users.length})</option>
            <option value="student">Sinh viên</option>
            <option value="employer">Nhà tuyển dụng</option>
            <option value="admin">Quản trị viên</option>
          </SelectNative>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    {u.full_name}{" "}
                    {u.is_demo ? (
                      <span className="text-[10px] font-medium text-indigo-600">
                        (Demo)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      u.role === "admin"
                        ? "cyan"
                        : u.role === "employer"
                        ? "default"
                        : "neutral"
                    }
                  >
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.is_active ? "verified" : "danger"}>
                    {u.is_active ? "Hoạt động" : "Đã khóa"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDateVN(u.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.role !== "admin" ? (
                    <Button
                      variant={u.is_active ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => setLockTarget(u)}
                    >
                      {u.is_active ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-rose-600" />
                          Khóa
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                          Mở khóa
                        </>
                      )}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={Boolean(lockTarget)}
        onClose={() => setLockTarget(null)}
        onConfirm={confirmToggleLock}
        loading={loading}
        danger={Boolean(lockTarget?.is_active)}
        title={
          lockTarget?.is_active
            ? "Khóa tài khoản người dùng"
            : "Mở khóa tài khoản"
        }
        description={`Bạn có chắc muốn ${
          lockTarget?.is_active ? "khóa tạm thời" : "mở khóa"
        } tài khoản ${lockTarget?.email}? Thao tác sẽ được ghi vào nhật ký quản trị.`}
      />
    </div>
  );
}

export function AdminEmployersList({
  employers,
}: {
  employers: EmployerProfile[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {employers.map((emp) => {
        const ver = VERIFICATION_STATUS_MAP[emp.verification_status];
        return (
          <Card key={emp.id} className="p-5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900">{emp.company_name}</h3>
                <p className="text-xs text-slate-500">
                  {emp.industry || "Chưa cập nhật ngành"}
                </p>
              </div>
              <Badge className={ver?.badgeClass}>
                {emp.verification_status === "verified" ? (
                  <BadgeCheck className="h-3.5 w-3.5" />
                ) : null}
                {ver?.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Địa chỉ: {emp.address || "Chưa cập nhật"}
            </p>
            <p className="text-xs text-slate-500">
              Liên hệ: {emp.contact_email || "—"} • {emp.contact_phone || "—"}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

export function AdminVerificationsPanel({
  verifications,
}: {
  verifications: VerificationRequest[];
}) {
  const router = useRouter();
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleReview(
    req: VerificationRequest,
    decision: "verified" | "rejected"
  ) {
    setBusyId(req.id);
    const res = await adminReviewVerificationAction({
      requestId: req.id,
      employerId: req.employer_id,
      decision,
      admin_note: notes[req.id] || "",
    });
    setBusyId(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  async function openDocument(url: string | null) {
    if (!url) {
      toast.info("Hồ sơ này không đính kèm tệp tài liệu.");
      return;
    }
    const res = await getAuthorizedFileUrlAction(url);
    if (res.ok && res.data?.signedUrl) {
      window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-4">
      {verifications.map((req) => (
        <Card key={req.id} className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {req.business_name}
                </h3>
                <Badge
                  tone={
                    req.status === "verified"
                      ? "verified"
                      : req.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {req.status === "verified"
                    ? "Đã xác minh"
                    : req.status === "rejected"
                    ? "Đã từ chối"
                    : "Chờ xử lý"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Người đại diện: <strong>{req.representative_name}</strong> • Mã
                số: {req.tax_code || "Không có"} • Ngày gửi:{" "}
                {formatDateVN(req.created_at)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Địa chỉ: {req.address || "—"} • ĐT: {req.contact_phone} • Email:{" "}
                {req.contact_email}
              </p>
            </div>

            {req.document_url ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDocument(req.document_url)}
              >
                <FileText className="h-4 w-4 text-blue-600" />
                Xem tài liệu minh chứng
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-3 border-t border-slate-100">
            <div className="md:col-span-7">
              <Input
                placeholder="Ghi chú thẩm định gửi nhà tuyển dụng..."
                value={notes[req.id] ?? req.admin_note ?? ""}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busyId === req.id}
                onClick={() => handleReview(req, "rejected")}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <X className="h-4 w-4" />
                Từ chối
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={busyId === req.id}
                onClick={() => handleReview(req, "verified")}
              >
                <Check className="h-4 w-4" />
                Duyệt xác minh
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdminJobsPanel({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function moderate(jobId: string, status: Job["status"]) {
    setBusyId(jobId);
    const res = await adminModerateJobAction({
      jobId,
      status,
      note:
        status === "rejected"
          ? "Ẩn tin do vi phạm quy chuẩn minh bạch"
          : "Khôi phục hiển thị tin tuyển dụng",
    });
    setBusyId(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Tin tuyển dụng</th>
            <th className="px-4 py-3">Đơn vị</th>
            <th className="px-4 py-3">Mức lương</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Kiểm duyệt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((j) => (
            <tr key={j.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <Link
                  href={`/jobs/${j.id}`}
                  className="font-semibold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  {j.title}
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Link>
                <p className="text-xs text-slate-500">
                  {j.category} • {j.location}
                </p>
              </td>
              <td className="px-4 py-3 text-xs font-medium text-slate-700">
                {j.employer?.company_name}
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-blue-700">
                {formatSalaryRange(j.salary_min, j.salary_max, j.salary_unit)}
              </td>
              <td className="px-4 py-3">
                <Badge
                  tone={
                    j.status === "active"
                      ? "verified"
                      : j.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {j.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right space-x-1.5">
                {j.status !== "rejected" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === j.id}
                    onClick={() => moderate(j.id, "rejected")}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Ẩn tin
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busyId === j.id}
                    onClick={() => moderate(j.id, "active")}
                  >
                    Khôi phục
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function AdminReportsPanel({ reports }: { reports: JobReport[] }) {
  const router = useRouter();
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function resolve(
    rep: JobReport,
    status: JobReport["status"],
    hideJob = false
  ) {
    setBusyId(rep.id);
    const res = await adminResolveReportAction({
      reportId: rep.id,
      status,
      admin_note:
        notes[rep.id] ||
        (hideJob
          ? "Đã xác nhận vi phạm và ẩn tin tuyển dụng khỏi hệ thống."
          : "Đã kiểm tra và xử lý báo cáo."),
      hideJob,
    });
    setBusyId(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-4">
      {reports.map((rep) => (
        <Card key={rep.id} className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="danger">{rep.reason}</Badge>
                <Badge
                  tone={
                    rep.status === "resolved"
                      ? "verified"
                      : rep.status === "pending"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {rep.status}
                </Badge>
              </div>
              <p className="mt-2 font-bold text-slate-900">
                Tin bị báo cáo:{" "}
                <Link
                  href={`/jobs/${rep.job_id}`}
                  className="text-blue-700 hover:underline"
                >
                  {rep.job?.title || rep.job_id}
                </Link>
              </p>
              <p className="text-xs text-slate-500">
                Người gửi: {rep.reporter?.full_name || "Người dùng"} •{" "}
                {formatDateVN(rep.created_at)}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            {rep.description}
          </p>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <Textarea
              placeholder="Ghi chú kết luận xử lý của Admin..."
              value={notes[rep.id] ?? rep.admin_note ?? ""}
              onChange={(e) =>
                setNotes((prev) => ({ ...prev, [rep.id]: e.target.value }))
              }
              className="min-h-[65px] text-xs"
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busyId === rep.id}
                onClick={() => resolve(rep, "rejected", false)}
              >
                Giữ nguyên tin (Báo cáo chưa đủ căn cứ)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={busyId === rep.id}
                onClick={() => resolve(rep, "resolved", false)}
              >
                Đánh dấu đã giải quyết
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={busyId === rep.id}
                onClick={() => resolve(rep, "resolved", true)}
              >
                <Ban className="h-3.5 w-3.5" />
                Xác nhận vi phạm & Ẩn tin ngay
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdminOverviewChartAndLogs({
  stats,
  logs,
}: {
  stats: {
    totalStudents: number;
    totalEmployers: number;
    activeJobs: number;
    totalApplications: number;
  };
  logs: AdminLog[];
}) {
  const chartData = [
    { name: "Sinh viên", value: stats.totalStudents },
    { name: "Nhà tuyển dụng", value: stats.totalEmployers },
    { name: "Việc đang tuyển", value: stats.activeJobs },
    { name: "Đơn ứng tuyển", value: stats.totalApplications },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-6 p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Quy mô hoạt động nền tảng
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-6 p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Nhật ký thao tác Quản trị viên (`admin_logs`)
        </h3>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500">Chưa có bản ghi nhật ký nào.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>{log.action}</span>
                  <span className="text-[11px] text-slate-400">
                    {formatDateVN(log.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">{log.note || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

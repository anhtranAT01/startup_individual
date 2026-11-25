"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Save,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { APPLICATION_STATUS_MAP } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import type { Application, ApplicationStatus, Job } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectNative, Textarea } from "@/components/ui/form-controls";
import {
  getAuthorizedFileUrlAction,
  updateApplicationStatusAction,
} from "@/services/actions";

export function EmployerApplicationsClient({
  applications,
  jobs,
  initialJobId,
}: {
  applications: Application[];
  jobs: Job[];
  initialJobId?: string;
}) {
  const router = useRouter();
  const [jobFilter, setJobFilter] = React.useState(initialJobId || "all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [notes, setNotes] = React.useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    applications.forEach((a) => {
      map[a.id] = a.employer_note || "";
    });
    return map;
  });
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const filtered = applications.filter((a) => {
    if (jobFilter !== "all" && a.job_id !== jobFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  async function handleUpdate(appId: string, nextStatus: ApplicationStatus) {
    setBusyId(appId);
    const res = await updateApplicationStatusAction({
      applicationId: appId,
      status: nextStatus,
      employer_note: notes[appId] || "",
    });
    setBusyId(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  async function handleViewCv(cvUrl: string | null) {
    if (!cvUrl) {
      toast.info("Ứng viên này chưa đính kèm tệp CV PDF.");
      return;
    }
    const res = await getAuthorizedFileUrlAction(cvUrl);
    if (res.ok && res.data?.signedUrl) {
      window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SelectNative
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-64"
          >
            <option value="all">Tất cả tin tuyển dụng ({applications.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </SelectNative>

          <SelectNative
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">Mọi trạng thái</option>
            {Object.entries(APPLICATION_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </SelectNative>
        </div>

        <span className="text-xs text-slate-500">
          Đang hiển thị <strong>{filtered.length}</strong> hồ sơ
        </span>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-2">
          <UserCheck className="h-9 w-9 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">
            Chưa có ứng viên nào khớp với bộ lọc
          </h3>
          <p className="text-xs text-slate-500">
            Các hồ sơ mới sẽ xuất hiện tại đây ngay khi sinh viên nhấn Ứng tuyển.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const st = APPLICATION_STATUS_MAP[app.status];
            const sp = app.student_profile;
            return (
              <Card key={app.id} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {app.student?.full_name || "Sinh viên ứng tuyển"}
                      </h3>
                      <Badge className={st?.badgeClass}>{st?.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ứng tuyển vị trí:{" "}
                      <strong className="text-blue-700">
                        {app.job?.title}
                      </strong>{" "}
                      • Nộp ngày {formatDateVN(app.created_at)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCv(app.cv_url || sp?.cv_url || null)}
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    {app.cv_url || sp?.cv_url ? "Mở xem CV PDF" : "Chưa có tệp CV"}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                {/* Authorized Student Contact & Academic Summary */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      Học vấn
                    </p>
                    <p>
                      {sp?.university || "Đang cập nhật"} •{" "}
                      {sp?.major || "Chuyên ngành"}
                      {sp?.year_of_study ? ` (Năm ${sp.year_of_study})` : ""}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-cyan-600" />
                      Thông tin liên hệ (Được cấp quyền)
                    </p>
                    <p>{app.student?.email}</p>
                    {app.student?.phone ? (
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {app.student.phone}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      Lịch đáp ứng & Kỹ năng
                    </p>
                    <p>{app.available_time || "Theo thỏa thuận"}</p>
                    {sp?.skills && sp.skills.length > 0 ? (
                      <p className="text-blue-700 font-medium">
                        Kỹ năng: {sp.skills.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="text-sm text-slate-700 bg-white rounded-xl border border-slate-100 p-3.5">
                  <strong className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                    Lời giới thiệu của ứng viên:
                  </strong>
                  {app.cover_letter}
                </div>

                {/* Internal Employer Note & Status Controls */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                  <div className="lg:col-span-7">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Ghi chú / Phản hồi gửi ứng viên:
                    </label>
                    <Textarea
                      value={notes[app.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [app.id]: e.target.value,
                        }))
                      }
                      placeholder="VD: Hẹn phỏng vấn chiều Thứ 5 lúc 15h00 tại cửa hàng..."
                      className="min-h-[64px] text-xs"
                    />
                  </div>

                  <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-2">
                    <SelectNative
                      defaultValue={app.status}
                      disabled={busyId === app.id}
                      onChange={(e) =>
                        handleUpdate(app.id, e.target.value as ApplicationStatus)
                      }
                      className="w-48 h-9 text-xs font-semibold"
                    >
                      <option value="pending">Chờ xem</option>
                      <option value="reviewed">Đã xem hồ sơ</option>
                      <option value="shortlisted">Danh sách tiềm năng</option>
                      <option value="accepted">Chấp nhận (Nhận việc)</option>
                      <option value="rejected">Từ chối</option>
                    </SelectNative>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === app.id}
                      onClick={() => handleUpdate(app.id, app.status)}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Lưu ghi chú
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

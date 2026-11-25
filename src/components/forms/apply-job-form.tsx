"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileUp, Send } from "lucide-react";
import { toast } from "sonner";
import type { Job, Profile, StudentProfile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form-controls";
import {
  submitApplicationAction,
  uploadStorageFileAction,
} from "@/services/actions";

export function ApplyJobForm({
  job,
  user,
  studentProfile,
}: {
  job: Job;
  user: Profile;
  studentProfile: StudentProfile | null;
}) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = React.useState("");
  const [experience, setExperience] = React.useState(
    studentProfile?.experience || ""
  );
  const [availableTime, setAvailableTime] = React.useState(
    (studentProfile?.availability?.shifts || []).join(", ") ||
      job.working_time
  );
  const [cvUrl, setCvUrl] = React.useState<string | null>(
    studentProfile?.cv_url || null
  );
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("bucket", "student-cvs");
    fd.set("file", file);
    const res = await uploadStorageFileAction(fd);
    setUploading(false);
    if (res.ok && res.data) {
      setCvUrl(res.data.url);
      toast.success("Đã đính kèm CV PDF thành công!");
    } else {
      toast.error(res.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitApplicationAction({
      job_id: job.id,
      cover_letter: coverLetter,
      relevant_experience: experience,
      available_time: availableTime,
      cv_url: cvUrl,
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    setSubmitted(true);
    toast.success(res.message);
    router.refresh();
  }

  if (submitted) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Đã gửi hồ sơ ứng tuyển thành công!
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Đơn ứng tuyển của bạn cho vị trí <strong>{job.title}</strong> tại{" "}
          <strong>{job.employer?.company_name}</strong> đã được ghi nhận. Bạn có
          thể theo dõi phản hồi trực tiếp trong trang Quản lý ứng tuyển.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/student/applications">
            <Button variant="primary">Theo dõi đơn ứng tuyển</Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline">Tìm thêm việc làm khác</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-slate-500">Họ tên ứng viên</span>
          <p className="font-semibold text-slate-900">{user.full_name}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Email & Liên hệ</span>
          <p className="font-semibold text-slate-900">
            {user.email} {user.phone ? `• ${user.phone}` : ""}
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Trường & Ngành học</span>
          <p className="font-medium text-slate-700">
            {studentProfile?.university || "Chưa cập nhật trường"} •{" "}
            {studentProfile?.major || "Chưa cập nhật ngành"}
          </p>
        </div>
        <div className="flex items-end justify-start sm:justify-end">
          <Link
            href="/student/profile"
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Chỉnh sửa thông tin hồ sơ →
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>CV đính kèm (PDF tối đa 5MB – Lưu trữ riêng tư bảo mật)</Label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <FileUp className="h-4 w-4 text-blue-600" />
              <span>{uploading ? "Đang tải CV..." : "Chọn tệp CV PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleCvUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-slate-500">
              {cvUrl
                ? "✓ Đã có tệp CV đính kèm trong hồ sơ"
                : "Chưa đính kèm CV (Khuyến khích tải lên để tăng tỷ lệ được chọn)"}
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="available_time">
            Thời gian / Ca làm việc bạn có thể đáp ứng *
          </Label>
          <Input
            id="available_time"
            required
            placeholder="Ví dụ: Ca tối T2, T4, T6 và cả ngày Chủ nhật"
            value={availableTime}
            onChange={(e) => setAvailableTime(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="experience">Kinh nghiệm hoặc kỹ năng liên quan</Label>
          <Textarea
            id="experience"
            placeholder="Tóm tắt các kỹ năng, hoạt động CLB hoặc công việc tương tự bạn từng tham gia..."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="min-h-[90px]"
          />
        </div>

        <div>
          <Label htmlFor="cover_letter">
            Lời giới thiệu gửi tới nhà tuyển dụng *
          </Label>
          <Textarea
            id="cover_letter"
            required
            placeholder="Chào anh/chị bộ phận tuyển dụng, em là sinh viên năm... Em rất quan tâm tới vị trí này vì..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="min-h-[130px]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline">Quay lại</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting || uploading}
          >
            <Send className="h-4 w-4" />
            {submitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ ứng tuyển"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
